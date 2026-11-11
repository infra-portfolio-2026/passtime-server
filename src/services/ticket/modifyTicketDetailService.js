import Ticket from "../../models/ticketModel.js";
import moment from "moment";

const generateUniqueEventCode = async () => {
  let uniqueCode;
  let isUnique = false;

  while (!isUnique) {
    uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const existingTicket = await Ticket.findOne({ eventCode: uniqueCode });
    if (!existingTicket) isUnique = true;
  }

  return uniqueCode;
};

export const createTicket = async (body) => {
  const {
    eventTitle,
    eventDay,
    eventStartTime,
    eventEndTime,
    eventPlace,
    eventPlaceComment,
    eventComment,
    eventCode,
    affiliation,
    kakaoPlace,
  } = body;

  if (
    !eventTitle ||
    !eventDay ||
    !eventStartTime ||
    !eventPlace ||
    !eventPlaceComment ||
    !eventComment ||
    !affiliation
  ) {
    return {
      status: 400,
      code: "ERROR-0003",
      message: "모든 필드를 채워주세요.",
    };
  }

  const validkakaoPlace =
    kakaoPlace &&
    typeof kakaoPlace === "object" &&
    kakaoPlace.place_name &&
    kakaoPlace.address_name &&
    kakaoPlace.x &&
    kakaoPlace.y;

  let finalEventCode = eventCode?.trim() || null;

  if (finalEventCode) {
    const existingTicket = await Ticket.findOne({ eventCode: finalEventCode });
    if (existingTicket) {
      return {
        status: 400,
        code: "ERROR-0004",
        message: "이벤트 코드가 중복됩니다. 다른 코드를 사용해주세요.",
      };
    }
  } else {
    finalEventCode = await generateUniqueEventCode();
  }

  const formattedEventStartTime = moment(eventStartTime, "HH:mm:ss").format(
    "HH:mm:ss"
  );
  const formattedEventEndTime = eventEndTime
    ? moment(eventEndTime, "HH:mm:ss").format("HH:mm:ss")
    : null;

  const newTicket = new Ticket({
    eventTitle,
    eventDay,
    eventStartTime: formattedEventStartTime,
    eventEndTime: formattedEventEndTime,
    eventPlace,
    eventPlaceComment,
    eventComment,
    eventCode: finalEventCode,
    affiliation,
    kakaoPlace: validkakaoPlace ? kakaoPlace : null,
  });

  const savedTicket = await newTicket.save();

  return {
    status: 201,
    code: "SUCCESS-0000",
    message: "이벤트가 성공적으로 생성되었습니다.",
    result: savedTicket,
  };
};

export const getTicketDetailById = async (ticketId) => {
  if (!ticketId) {
    return {
      status: 400,
      code: "ERROR-0003",
      message: "티켓 ID가 누락되었습니다.",
    };
  }

  const ticket = await Ticket.findById(ticketId, {
    eventTitle: 1,
    eventDay: 1,
    eventStartTime: 1,
    eventEndTime: 1,
    eventPlace: 1,
    eventComment: 1,
    eventPlaceComment: 1,
    eventCode: 1,
    affiliation: 1,
    kakaoPlace: 1,
  });

  if (!ticket) {
    return {
      status: 404,
      code: "ERROR-0004",
      message: "해당 티켓을 찾을 수 없습니다.",
    };
  }

  return {
    status: 200,
    code: "SUCCESS-0000",
    message: "요청에 성공하였습니다.",
    result: ticket,
  };
};
