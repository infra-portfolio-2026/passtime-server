import Ticket from "../../models/ticketModel.js";
import ParticipationHistory from "../../models/participationHistoryModel.js";
import moment from "moment";
import "moment/locale/ko.js";

moment.locale("ko");

const formatTime = (value) =>
  value ? moment(value, ["HH:mm:ss", "HH:mm"]).format("HH:mm") : "";

const getTicketDetailFromHistory = async (ticketId) => {
  const history = await ParticipationHistory.findOne({
    ticketId: String(ticketId),
  });

  if (!history) {
    return {
      status: 404,
      code: "ERROR-0004",
      message: "해당 티켓을 찾을 수 없습니다.",
      result: [],
    };
  }

  return {
    status: 200,
    code: "SUCCESS-0000",
    message: "요청에 성공하였습니다.",
    result: {
      ticketId: history.ticketId,
      eventTitle: history.eventTitle,
      eventDay: history.eventDay
        ? moment(history.eventDay).format("YYYY.MM.DD(ddd)")
        : "",
      eventStartTime: formatTime(history.eventStartTime),
      eventEndTime: formatTime(history.eventEndTime),
      eventPlace: history.eventPlace,
      eventComment: history.eventComment,
      eventPlaceComment: history.eventPlaceComment,
      eventCode: history.eventCode,
      affiliation: history.affiliation,
      kakaoPlace: history.kakaoPlace ?? null,
      fromHistory: true,
      ticketDeleted: true,
    },
  };
};

export const getTicketDetail = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId, {
    eventTitle: 1,
    eventDay: 1,
    eventStartTime: 1,
    eventEndTime: 1,
    eventPlace: 1,
    eventComment: 1,
    eventPlaceComment: 1,

    affiliation: 1,
    kakaoPlace: 1,
  });

  if (!ticket) {
    return getTicketDetailFromHistory(ticketId);
  }

  const formattedEventDay = moment(ticket.eventDay).format("YYYY.MM.DD(ddd)");
  const formattedStartTime = moment(ticket.eventStartTime, [
    "HH:mm:ss",
    "HH:mm",
  ]).format("HH:mm");
  const formattedEndTime = ticket.eventEndTime
    ? moment(ticket.eventEndTime, ["HH:mm:ss", "HH:mm"]).format("HH:mm")
    : "";

  const formattedTicket = {
    ...ticket.toObject(),
    eventDay: formattedEventDay,
    eventStartTime: formattedStartTime,
    eventEndTime: formattedEndTime,
  };

  return {
    status: 200,
    code: "SUCCESS-0000",
    message: "요청에 성공하였습니다.",
    result: formattedTicket,
  };
};
