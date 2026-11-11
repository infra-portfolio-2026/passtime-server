import Payment from "../../models/paymentModel.js";
import User from "../../models/userModel.js";
import Ticket from "../../models/ticketModel.js";
import sendTicketApprovalNotification from "../FCM/sendTicketApprovalNotification.js";
import { checkAndSendReminderIfDue } from "../FCM/sendEventReminderNotification.js";
import { getPaymentsByAdmin } from "./paymentListService.js";

export const approvePayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) return { error: "PAYMENT_NOT_FOUND" };

  payment.paymentPermissionStatus = true;
  await payment.save();

  const user = await User.findOne({ studentId: payment.studentId });
  if (!user) return { error: "USER_NOT_FOUND" };

  if (!user.tickets.includes(payment.ticketId)) {
    user.tickets.push(payment.ticketId);
    await user.save();
    checkAndSendReminderIfDue(payment.ticketId, user._id).catch((err) => {
      console.error("이벤트 리마인더 즉시 발송 실패:", err);
    });
  }

  const ticket = await Ticket.findById(payment.ticketId);
  const eventTitle = ticket?.eventTitle || "이벤트";

  await sendTicketApprovalNotification(user._id, eventTitle);

  return {
    paymentId: payment._id,
    paymentPermissionStatus: payment.paymentPermissionStatus,
    userId: user._id,
    updatedTickets: user.tickets,
  };
};

export const approveAllPayments = async (studentId, affiliationId) => {
  const payments = await getPaymentsByAdmin(studentId, affiliationId);
  const pendingPayments = payments.filter((p) => !p.paymentPermissionStatus);

  const approved = [];
  const errors = [];

  for (const payment of pendingPayments) {
    const result = await approvePayment(payment._id);

    if (result.error) {
      errors.push({ paymentId: payment._id, error: result.error });
    } else {
      approved.push(result);
    }
  }

  return {
    totalCount: payments.length,
    approvedCount: approved.length,
    skippedCount: payments.length - pendingPayments.length,
    failedCount: errors.length,
    approved,
    errors,
  };
};
