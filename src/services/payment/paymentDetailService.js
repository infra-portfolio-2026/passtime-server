import Payment from "../../models/paymentModel.js";
import Ticket from "../../models/ticketModel.js";

export const getPaymentDetail = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;

  const ticket = await Ticket.findById(payment.ticketId);
  if (!ticket) return null;

  return {
    ticketId: payment.ticketId,
    paymentId: payment._id,
    name: payment.name,
    studentId: payment.studentId,
    phone: payment.phone,
    paymentPermissionStatus: payment.paymentPermissionStatus,
    eventTitle: ticket.eventTitle,
    paymentPicture: payment.paymentPicture,
    aiReviewStatus: payment.aiReviewStatus ?? "none",
    aiReview: payment.aiReview ?? null,
  };
};
