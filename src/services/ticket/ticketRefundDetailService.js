import Refund from "../../models/refundModel.js";
import Ticket from "../../models/ticketModel.js";
import User from "../../models/userModel.js";

export const getTicketRefundDetail = async (ticketId) => {
  const refund = await Refund.findOne({ ticketId });
  if (!refund) return { error: "refund_not_found" };

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return { error: "ticket_not_found" };

  const user = await User.findOne({ name: refund.name });
  if (!user) return { error: "user_not_found" };

  return {
    name: refund.name,
    studentId: user.studentId,
    major: user.major,
    phone: refund.phone,
    eventName: ticket.eventTitle,
    bankName: refund.bankName,
    accountNumber: refund.accountNumber,
    visitDate: refund.visitDate,
    visitTime: refund.visitTime,
    refundPermissionStatus: refund.refundPermissionStatus === true,
    refundReason: refund.refundReason,
    _id: refund._id,
  };
};
