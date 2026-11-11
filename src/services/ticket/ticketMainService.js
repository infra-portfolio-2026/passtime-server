import Ticket from "../../models/ticketModel.js";
import Refund from "../../models/refundModel.js";
import Payment from "../../models/paymentModel.js";
import User from "../../models/userModel.js";
import moment from "moment";
import "moment/locale/ko.js";

moment.locale("ko");

export const getTicketStatus = async (ticketId, studentId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return "상태 없음";

  if (ticket.status === "만료됨") {
    return "만료됨";
  }

  const refund = await Refund.findOne({ ticketId, studentId });
  if (refund) {
    if (refund.refundPermissionStatus === false) return "환불중";
    if (refund.refundPermissionStatus === true) return "환불됨";
  }

  const payment = await Payment.findOne({
    ticketId: String(ticketId),
    studentId,
  }).sort({ paymentPermissionStatus: -1 });
  if (payment) {
    if (payment.paymentPermissionStatus === false) return "사용 불가";
    if (payment.paymentPermissionStatus === true) return "사용 가능";
  }

  return "상태 없음";
};

export const getUserTicketsWithStatus = async (studentId) => {
  const user = await User.findOne({ studentId });

  if (!user || !user.tickets || user.tickets.length === 0) {
    return null;
  }

  const tickets = await Ticket.find({ _id: { $in: user.tickets } });
  if (!tickets || tickets.length === 0) {
    return null;
  }

  const ticketStatuses = await Promise.all(
    tickets.map(async (ticket) => {
      const status = await getTicketStatus(ticket._id, studentId);

      const formattedEventDay = moment(ticket.eventDay).format(
        "YYYY.MM.DD(ddd)"
      );
      const formattedStartTime = moment(ticket.eventStartTime, [
        "HH:mm:ss",
        "HH:mm",
      ]).format("HH:mm");
      const formattedEndTime = ticket.eventEndTime
        ? moment(ticket.eventEndTime, ["HH:mm:ss", "HH:mm"]).format("HH:mm")
        : "";

      return {
        ...ticket.toObject(),
        eventDay: formattedEventDay,
        eventStartTime: formattedStartTime,
        eventEndTime: formattedEndTime,
        status,
      };
    })
  );

  return ticketStatuses;
};
