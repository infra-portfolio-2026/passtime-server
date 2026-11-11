import Refund from "../../models/refundModel.js";
import User from "../../models/userModel.js";
import Ticket from "../../models/ticketModel.js";

export const approveRefundAndNotify = async (
  refundId,
  sendRefundNotification
) => {
  if (!refundId) {
    return {
      status: 400,
      code: "ERROR-0001",
      message: "필수 데이터가 누락되었습니다.",
    };
  }

  const refund = await Refund.findById(refundId);
  if (!refund) {
    return {
      status: 404,
      code: "ERROR-0002",
      message: "해당 환불 요청을 찾을 수 없습니다.",
    };
  }

  refund.refundPermissionStatus = true;
  refund.refundApprovedAt = new Date();
  await refund.save();

  const user = await User.findOne({
    name: refund.name,
    department: refund.department,
    studentId: refund.studentId,
  });

  if (!user) {
    return {
      status: 404,
      code: "ERROR-0004",
      message: "유저 정보를 찾을 수 없습니다.",
    };
  }

  const ticket = await Ticket.findById(refund.ticketId);
  await sendRefundNotification(user._id, ticket?.eventTitle || "");

  return {
    status: 200,
    code: "SUCCESS-0000",
    message: "환불 요청이 승인되었습니다.",
    result: {
      refundId: refund._id,
      refundPermissionStatus: refund.refundPermissionStatus,
    },
  };
};
