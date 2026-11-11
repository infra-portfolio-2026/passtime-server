import User from "../../models/userModel.js";
import Ticket from "../../models/ticketModel.js";
import ParticipationHistory from "../../models/participationHistoryModel.js";
import moment from "moment";
import "moment/locale/ko.js";
import {
  getTicketStatus,
  getUserTicketsWithStatus,
} from "../ticket/ticketMainService.js";
import { countPaymentsByTicketIds } from "../payment/paymentCountService.js";

moment.locale("ko");

const PARTICIPATED_STATUSES = new Set(["사용 가능", "만료됨"]);

const formatParticipatedEvent = (ticket, countMap = {}) => {
  const ticketId = ticket._id?.toString?.() ?? String(ticket._id);
  const counts = countMap[ticketId];

  return {
    ticketId: ticket._id,
    eventTitle: ticket.eventTitle,
    eventDay: ticket.eventDay,
    eventStartTime: ticket.eventStartTime,
    eventEndTime: ticket.eventEndTime,
    eventPlace: ticket.eventPlace,
    affiliation: ticket.affiliation,
    status: ticket.status,
    participantCount: counts?.totalCount ?? 0,
    fromHistory: false,
  };
};

const formatHistoryEvent = (history) => ({
  ticketId: history.ticketId,
  eventTitle: history.eventTitle,
  eventDay: history.eventDay
    ? moment(history.eventDay).format("YYYY.MM.DD(ddd)")
    : "",
  eventStartTime: history.eventStartTime
    ? moment(history.eventStartTime, ["HH:mm:ss", "HH:mm"]).format("HH:mm")
    : "",
  eventEndTime: history.eventEndTime
    ? moment(history.eventEndTime, ["HH:mm:ss", "HH:mm"]).format("HH:mm")
    : "",
  eventPlace: history.eventPlace,
  affiliation: history.affiliation,
  status: history.status,
  participantCount: history.participantCount ?? 0,
  fromHistory: true,
});

export const getUserParticipatedEventCount = async (studentId) => {
  const user = await User.findOne({ studentId }).select("tickets");
  const liveTicketIds = new Set((user?.tickets || []).map(String));

  let participatedCount = 0;
  let pendingCount = 0;
  let refundCount = 0;
  let totalCount = 0;

  if (liveTicketIds.size) {
    const tickets = await Ticket.find({ _id: { $in: [...liveTicketIds] } });
    totalCount = tickets.length;

    for (const ticket of tickets) {
      const status = await getTicketStatus(ticket._id, studentId);

      if (status === "사용 가능" || status === "만료됨") {
        participatedCount += 1;
      } else if (status === "사용 불가") {
        pendingCount += 1;
      } else if (status === "환불중" || status === "환불됨") {
        refundCount += 1;
      }
    }
  }

  const historyDocs = await ParticipationHistory.find(
    { studentId },
    { ticketId: 1 }
  );
  const historyCount = historyDocs.filter(
    (h) => !liveTicketIds.has(String(h.ticketId))
  ).length;

  participatedCount += historyCount;
  totalCount += historyCount;

  return {
    participatedCount,
    totalCount,
    pendingCount,
    refundCount,
  };
};

export const getUserParticipatedEventList = async (studentId) => {
  const tickets = (await getUserTicketsWithStatus(studentId)) || [];

  const filtered = tickets.filter((ticket) =>
    PARTICIPATED_STATUSES.has(ticket.status)
  );

  const liveTicketIds = new Set(filtered.map((ticket) => ticket._id.toString()));
  const countMap = await countPaymentsByTicketIds([...liveTicketIds]);

  const liveItems = filtered.map((ticket) =>
    formatParticipatedEvent(ticket, countMap)
  );

  const historyDocs = await ParticipationHistory.find({ studentId });
  const historyItems = historyDocs
    .filter((h) => !liveTicketIds.has(String(h.ticketId)))
    .map(formatHistoryEvent);

  return [...liveItems, ...historyItems].sort(
    (a, b) =>
      moment(b.eventDay, "YYYY.MM.DD(ddd)").valueOf() -
      moment(a.eventDay, "YYYY.MM.DD(ddd)").valueOf()
  );
};
