import Refund from "../../models/refundModel.js";
import Ticket from "../../models/ticketModel.js";

export const getRefundDetail = async (refundId) => {
  const refund = await Refund.findById(refundId);
  if (!refund) return null;

  const ticket = await Ticket.findById(refund.ticketId);
  return {
    refund,
    eventTitle: ticket ? ticket.eventTitle : "알 수 없는 이벤트",
  };
};
