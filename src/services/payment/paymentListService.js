import Payment from "../../models/paymentModel.js";
import Ticket from "../../models/ticketModel.js";
import User from "../../models/userModel.js";
import Affiliation from "../../models/affiliationModel.js";
import Refund from "../../models/refundModel.js";
import { findPaymentsByTicketIds } from "./paymentCountService.js";
import {
  findUserAffiliation,
  hasHostPermission,
} from "../../utils/affiliationRole.js";

const getPaymentsForAffiliationName = async (affiliationName) => {
  const tickets = await Ticket.find({ affiliation: affiliationName });
  const ticketIds = tickets.map((ticket) => ticket._id.toString());

  if (!ticketIds.length) {
    return [];
  }

  return findPaymentsByTicketIds(ticketIds);
};

export const getPaymentsByAdmin = async (studentId, affiliationId) => {
  const user = await User.findOne({ studentId });
  if (!user) return [];

  if (affiliationId) {
    const affiliation = await Affiliation.findById(affiliationId);
    if (!affiliation) return [];

    if (user.root !== true) {
      const targetAffiliation = findUserAffiliation(user, affiliationId);

      if (!targetAffiliation || !hasHostPermission(targetAffiliation)) {
        return [];
      }
    }

    return getPaymentsForAffiliationName(affiliation.name);
  }

  if (user.root === true) {
    return Payment.find({});
  }

  const targetAffiliation = findUserAffiliation(user, affiliationId);

  if (!targetAffiliation || !hasHostPermission(targetAffiliation)) return [];

  return getPaymentsForAffiliationName(targetAffiliation.name);
};

const excludeRefundedPayments = async (payments) => {
  if (!payments.length) return [];

  const ticketIds = [...new Set(payments.map((p) => String(p.ticketId)))];
  const studentIds = [...new Set(payments.map((p) => p.studentId))];

  const refunds = await Refund.find({
    ticketId: { $in: ticketIds },
    studentId: { $in: studentIds },
  });

  const refundedKeys = new Set(
    refunds.map((r) => `${String(r.ticketId)}:${r.studentId}`)
  );

  return payments.filter(
    (p) => !refundedKeys.has(`${String(p.ticketId)}:${p.studentId}`)
  );
};

export const getPaymentListByAdmin = async (studentId, affiliationId) => {
  const payments = await excludeRefundedPayments(
    await getPaymentsByAdmin(studentId, affiliationId)
  );

  const ticketIds = [...new Set(payments.map((p) => String(p.ticketId)))];
  const tickets = ticketIds.length
    ? await Ticket.find({ _id: { $in: ticketIds } })
    : [];
  const affiliationByTicketId = Object.fromEntries(
    tickets.map((t) => [t._id.toString(), t.affiliation])
  );

  return payments.map((payment) => ({
    ticketId: payment.ticketId,
    paymentId: payment._id,
    name: payment.name,
    studentId: payment.studentId,
    major: payment.major,
    affiliation: affiliationByTicketId[String(payment.ticketId)] ?? null,
    paymentPermissionStatus: payment.paymentPermissionStatus,
    status: payment.paymentPermissionStatus ? "승인됨" : "승인대기",
    aiReviewStatus: payment.aiReviewStatus ?? "none",
    aiReviewReasons:
      payment.aiReviewStatus === "suspicious"
        ? payment.aiReview?.reasons ?? []
        : [],
  }));
};

export const getPaymentCountByAdmin = async (studentId, affiliationId) => {
  const payments = await excludeRefundedPayments(
    await getPaymentsByAdmin(studentId, affiliationId)
  );
  const approvedCount = payments.filter((p) => p.paymentPermissionStatus).length;
  const pendingCount = payments.length - approvedCount;

  return {
    totalCount: payments.length,
    approvedCount,
    pendingCount,
  };
};
