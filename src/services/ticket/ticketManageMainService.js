import Ticket from "../../models/ticketModel.js";
import User from "../../models/userModel.js";
import {
  countPaymentsByTicketIds,
  countPendingRefundsByTicketIds,
} from "../payment/paymentCountService.js";
import { hasHostPermission } from "../../utils/affiliationRole.js";
import moment from "moment";
import "moment/locale/ko.js";

moment.locale("ko");

const getAdminTicketStatus = (ticket) => {
  if (ticket.status === "만료됨") {
    return "만료됨";
  }
  return "사용 가능";
};

export const getAdminTicketsWithStatus = async (studentId) => {
  const user = await User.findOne({ studentId });
  if (!user) return [];

  let tickets = [];

  if (user.root === true) {
    tickets = await Ticket.find({});
  } else {
    const adminAffiliationNames = (user.affiliations || [])
      .filter((aff) => hasHostPermission(aff))
      .map((aff) => aff.name);

    if (!adminAffiliationNames.length) return [];

    tickets = await Ticket.find({
      affiliation: { $in: adminAffiliationNames },
    });
  }

  if (!tickets.length) return [];

  const ticketIds = tickets.map((ticket) => ticket._id.toString());
  const countMap = await countPaymentsByTicketIds(ticketIds);
  const refundPendingCountMap = await countPendingRefundsByTicketIds(ticketIds);

  const ticketStatuses = tickets.map((ticket) => {
    const status = getAdminTicketStatus(ticket);
    const ticketId = ticket._id.toString();
    const counts = countMap[ticketId];

    const formattedEventDay = moment(ticket.eventDay).format("YYYY.MM.DD(ddd)");
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
      totalCount: counts?.totalCount ?? 0,
      pendingCount: counts?.pendingCount ?? 0,
      approvedCount: counts?.approvedCount ?? 0,
      refundPendingCount: refundPendingCountMap[ticketId] ?? 0,
    };
  });

  return ticketStatuses;
};
