import Ticket from "../../models/ticketModel.js";
import User from "../../models/userModel.js";
import Payment from "../../models/paymentModel.js";

export const addTicketByNFC = async (userProfile, eventCode) => {
  if (!userProfile) {
    return {
      status: 401,
      code: "ERROR-0007",
      message: "유효하지 않은 SSO 토큰입니다.",
    };
  }

  const ticket = await Ticket.findOne({ eventCode });
  if (!ticket) {
    return {
      status: 404,
      code: "ERROR-0004",
      message: "해당 eventCode의 티켓을 찾을 수 없습니다.",
    };
  }

  const user = await User.findOne({ studentId: userProfile.studentId });
  if (!user) {
    return {
      status: 404,
      code: "ERROR-0005",
      message: "해당 사용자를 찾을 수 없습니다.",
    };
  }

  const isRoot = user.root === true;
  const hasAffiliation =
    Array.isArray(user.affiliations) &&
    user.affiliations.some((aff) => aff.name === ticket.affiliation);

  if (!isRoot && !hasAffiliation) {
    return {
      status: 403,
      code: "ERROR-0006",
      message: `해당 티켓(${ticket.affiliation}) 소속이 아니므로 추가할 수 없습니다.`,
    };
  }

  const ticketIdStr = ticket._id.toString();

  if (!user.tickets) {
    user.tickets = [];
  }

  const hasTicket = user.tickets.some((t) => String(t) === ticketIdStr);
  if (!hasTicket) {
    user.tickets.push(ticketIdStr);
    if (!user.eventReminderExcludedTickets) {
      user.eventReminderExcludedTickets = [];
    }
    if (
      !user.eventReminderExcludedTickets.some((id) => String(id) === ticketIdStr)
    ) {
      user.eventReminderExcludedTickets.push(ticketIdStr);
    }
    await user.save();
  }

  const existingPayment = await Payment.findOne({
    ticketId: ticketIdStr,
    studentId: user.studentId,
  });

  if (existingPayment) {
    if (!existingPayment.paymentPermissionStatus) {
      existingPayment.paymentPermissionStatus = true;
      await existingPayment.save();
    }
  } else {
    const newPayment = new Payment({
      ticketId: ticketIdStr,
      name: user.name,
      studentId: user.studentId,
      phone: user.phone || "현장 조사 필요",
      major: user.major,
      paymentPicture: "",
      paymentPermissionStatus: true,
      etc: "NFC 현장 등록",
    });
    await newPayment.save();
  }

  return {
    status: 200,
    code: "SUCCESS-0001",
    message:
      "티켓이 사용자에게 성공적으로 추가되었고, Payment 문서가 생성 또는 이미 존재합니다.",
    result: user,
  };
};
