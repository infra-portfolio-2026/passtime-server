import {
  reviewPaymentByAi,
  reviewPaymentsByAiBatch,
} from "../../services/payment/paymentAiReviewService.js";

const parseCriteria = (body) => {
  const criteria = body?.criteria ?? body;
  return {
    announcementDate: criteria.announcementDate,
    participationFee: criteria.participationFee,
    accountHolderName: criteria.accountHolderName,
  };
};

export const paymentAiReviewController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { paymentId, affiliationId, autoApprove } = req.body;
    const criteria = parseCriteria(req.body);

    if (!paymentId) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0001",
        message: "paymentId가 누락되었습니다.",
        result: [],
      });
    }

    const result = await reviewPaymentByAi({
      studentId,
      paymentId,
      affiliationId,
      criteria,
      autoApprove: autoApprove !== false,
    });

    if (result.error === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0002",
        message: "해당 납부 내역을 찾을 수 없습니다.",
        result: [],
      });
    }

    if (result.error === "FORBIDDEN") {
      return res.status(403).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: result.message || "권한이 없습니다.",
        result: [],
      });
    }

    if (
      result.error === "INVALID_CRITERIA" ||
      result.error === "ALREADY_APPROVED" ||
      result.error === "NO_PICTURE"
    ) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0004",
        message: result.message,
        result: [],
      });
    }

    if (result.error === "IMAGE_NOT_FOUND" || result.error === "AI_REVIEW_FAILED") {
      return res.status(422).json({
        isSuccess: false,
        code: "ERROR-0005",
        message: result.message,
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: result.autoApproved
        ? "AI 검토 후 자동 승인되었습니다."
        : result.aiReviewStatus === "suspicious"
          ? "AI 검토 결과 확인이 필요합니다."
          : "AI 검토가 완료되었습니다.",
      result,
    });
  } catch (error) {
    console.error("❌ AI 납부 검토 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0006",
      message: "서버 오류",
      result: [],
    });
  }
};

export const paymentAiReviewBatchController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId, ticketId, autoApprove } = req.body;
    const criteria = parseCriteria(req.body);

    if (!affiliationId) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0001",
        message: "affiliationId가 누락되었습니다.",
        result: [],
      });
    }

    const result = await reviewPaymentsByAiBatch({
      studentId,
      affiliationId,
      ticketId,
      criteria,
      autoApprove: autoApprove !== false,
    });

    if (result.error === "INVALID_CRITERIA") {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0002",
        message: result.message,
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "AI 일괄 검토가 완료되었습니다.",
      result,
    });
  } catch (error) {
    console.error("❌ AI 납부 일괄 검토 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "서버 오류",
      result: [],
    });
  }
};
