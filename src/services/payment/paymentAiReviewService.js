import Payment from "../../models/paymentModel.js";
import Ticket from "../../models/ticketModel.js";
import User from "../../models/userModel.js";
import { evaluatePaymentReview } from "../../utils/paymentAiMatcher.js";
import {
  findUserAffiliation,
  hasHostPermission,
} from "../../utils/affiliationRole.js";
import { approvePayment } from "./paymentPermissionService.js";
import { getPaymentsByAdmin } from "./paymentListService.js";
import {
  analyzePaymentImage,
  readPaymentImage,
} from "./paymentAiGeminiService.js";

const validateCriteria = (criteria) => {
  if (!criteria) return "criteria가 누락되었습니다.";

  const { announcementDate, participationFee, accountHolderName } = criteria;

  if (!announcementDate) return "announcementDate(행사 공시일)가 필요합니다.";
  if (participationFee == null || Number.isNaN(Number(participationFee))) {
    return "participationFee(참가비)가 필요합니다.";
  }
  if (!accountHolderName?.trim()) {
    return "accountHolderName(계좌 받는 사람 이름)이 필요합니다.";
  }

  return null;
};

const assertCanReviewPayment = async (studentId, payment, affiliationId) => {
  const user = await User.findOne({ studentId });
  if (!user) return { error: "USER_NOT_FOUND" };

  const ticket = await Ticket.findById(payment.ticketId);
  if (!ticket) return { error: "TICKET_NOT_FOUND" };

  if (user.root === true) {
    return { ok: true, ticket };
  }

  if (!affiliationId) {
    return { error: "FORBIDDEN", message: "affiliationId가 필요합니다." };
  }

  const targetAffiliation = findUserAffiliation(user, affiliationId);
  if (!targetAffiliation || !hasHostPermission(targetAffiliation)) {
    return { error: "FORBIDDEN", message: "납부 AI 검토 권한이 없습니다." };
  }

  if (ticket.affiliation !== targetAffiliation.name) {
    return {
      error: "FORBIDDEN",
      message: "해당 소속의 납부 내역이 아닙니다.",
    };
  }

  return { ok: true, ticket };
};

const formatReviewResult = (payment, evaluation, extracted, autoApproved) => ({
  paymentId: payment._id,
  paymentPermissionStatus: payment.paymentPermissionStatus,
  aiReviewStatus: payment.aiReviewStatus,
  aiReview: payment.aiReview,
  extracted,
  evaluation,
  autoApproved,
});

export const reviewPaymentByAi = async ({
  studentId,
  paymentId,
  affiliationId,
  criteria,
  autoApprove = true,
}) => {
  const criteriaError = validateCriteria(criteria);
  if (criteriaError) {
    return { error: "INVALID_CRITERIA", message: criteriaError };
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) return { error: "PAYMENT_NOT_FOUND" };

  if (payment.paymentPermissionStatus) {
    return {
      error: "ALREADY_APPROVED",
      message: "이미 승인된 납부 내역입니다.",
    };
  }

  if (!payment.paymentPicture) {
    return {
      error: "NO_PICTURE",
      message: "납부 증빙 사진이 없습니다.",
    };
  }

  const permission = await assertCanReviewPayment(
    studentId,
    payment,
    affiliationId
  );
  if (permission.error) return permission;

  const normalizedCriteria = {
    announcementDate: String(criteria.announcementDate).slice(0, 10),
    participationFee: Number(criteria.participationFee),
    accountHolderName: String(criteria.accountHolderName).trim(),
  };

  payment.aiReviewStatus = "reviewing";
  await payment.save();

  try {
    const image = await readPaymentImage(payment.paymentPicture);
    if (!image) {
      payment.aiReviewStatus = "failed";
      payment.aiReview = {
        reasons: ["납부 증빙 사진 파일을 읽을 수 없습니다."],
        criteria: normalizedCriteria,
        reviewedAt: new Date(),
      };
      await payment.save();
      return { error: "IMAGE_NOT_FOUND", message: payment.aiReview.reasons[0] };
    }

    const extracted = await analyzePaymentImage({
      image,
      paymentName: payment.name,
      criteria: normalizedCriteria,
    });

    const evaluation = evaluatePaymentReview({
      criteria: normalizedCriteria,
      payment,
      extracted,
      aiConfidence: extracted.confidence,
    });

    payment.aiReviewStatus = evaluation.status;
    payment.aiReview = {
      extractedAmount: extracted.amount,
      extractedDate: extracted.date,
      normalizedDate: evaluation.normalizedDate,
      extractedSenderName: extracted.senderName,
      extractedAccountHolderName: extracted.accountHolderName,
      extractedCounterpartyName: extracted.counterpartyName,
      isTransferScreenshot: extracted.isPaymentProof,
      confidence: extracted.confidence,
      ruleScore: evaluation.ruleScore,
      combinedConfidence: evaluation.combinedConfidence,
      reasons: evaluation.reasons,
      notes: evaluation.notes,
      criteria: normalizedCriteria,
      reviewedAt: new Date(),
      model: extracted.model,
    };
    await payment.save();

    let autoApproved = false;
    if (autoApprove && evaluation.canAutoApprove) {
      const approveResult = await approvePayment(payment._id);
      if (!approveResult.error) {
        autoApproved = true;
        payment.aiReviewStatus = "auto_approved";
        await payment.save();
      }
    }

    return formatReviewResult(payment, evaluation, extracted, autoApproved);
  } catch (error) {
    payment.aiReviewStatus = "failed";
    payment.aiReview = {
      reasons: [error.message || "AI 검토 중 오류가 발생했습니다."],
      criteria: normalizedCriteria,
      reviewedAt: new Date(),
    };
    await payment.save();
    return { error: "AI_REVIEW_FAILED", message: error.message };
  }
};

export const reviewPaymentsByAiBatch = async ({
  studentId,
  affiliationId,
  ticketId,
  criteria,
  autoApprove = true,
}) => {
  const criteriaError = validateCriteria(criteria);
  if (criteriaError) {
    return { error: "INVALID_CRITERIA", message: criteriaError };
  }

  let payments = await getPaymentsByAdmin(studentId, affiliationId);

  if (ticketId) {
    payments = payments.filter((p) => String(p.ticketId) === String(ticketId));
  }

  const targets = payments.filter(
    (p) =>
      !p.paymentPermissionStatus &&
      p.paymentPicture &&
      p.aiReviewStatus !== "auto_approved"
  );

  const results = [];
  const errors = [];

  for (const payment of targets) {
    const result = await reviewPaymentByAi({
      studentId,
      paymentId: payment._id,
      affiliationId,
      criteria,
      autoApprove,
    });

    if (result.error) {
      errors.push({
        paymentId: payment._id,
        error: result.error,
        message: result.message,
      });
    } else {
      results.push(result);
    }
  }

  return {
    totalTargets: targets.length,
    reviewedCount: results.length,
    failedCount: errors.length,
    autoApprovedCount: results.filter((r) => r.autoApproved).length,
    suspiciousCount: results.filter((r) => r.aiReviewStatus === "suspicious")
      .length,
    results,
    errors,
  };
};
