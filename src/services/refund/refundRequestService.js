import Refund from "../../models/refundModel.js";
import User from "../../models/userModel.js";
import Ticket from "../../models/ticketModel.js";
import sendRefundRequestNotification from "../FCM/sendRefundRequestNotification.js";

export const createRefundRequest = async (userProfile, body) => {
  const { refundReason, visitDate, visitTime, ticketId, phone, bankName, accountNumber } =
    body;

  const { major, studentId, name } = userProfile;

  if (
    !refundReason ||
    !visitDate ||
    !visitTime ||
    !ticketId ||
    !phone ||
    !bankName ||
    !accountNumber
  ) {
    return { status: 400, code: "ERROR-0002", message: "필수 데이터가 누락되었습니다." };
  }

  const user = await User.findOne({ studentId });

  if (!user) {
    return { status: 404, code: "ERROR-0003", message: "해당 사용자를 찾을 수 없습니다." };
  }

  if (!user.tickets.includes(ticketId)) {
    return {
      status: 404,
      code: "ERROR-0006",
      message: "현재 환불하려는 티켓은 없는 티켓입니다.",
    };
  }

  const newRefund = new Refund({
    ticketId,
    name,
    studentId,
    phone,
    refundReason,
    bankName,
    accountNumber,
    visitDate,
    visitTime,
    major,
    refundPermissionStatus: false,
  });

  const savedRefund = await newRefund.save();

  user.refunds.push(savedRefund._id);
  await user.save();

  try {
    const ticket = await Ticket.findById(ticketId);
    if (ticket?.affiliation) {
      await sendRefundRequestNotification({
        affiliationName: ticket.affiliation,
        eventTitle: ticket.eventTitle,
        requesterName: name,
      });
    }
  } catch (notifyError) {
    console.error("❌ 환불 신청 알림 호출 실패:", notifyError);
  }

  return {
    status: 200,
    code: "SUCCESS-0000",
    message: "환불 요청이 성공적으로 처리되었습니다.",
    result: savedRefund,
  };
};
    