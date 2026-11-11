import Ticket from "../../models/ticketModel.js";
import User from "../../models/userModel.js";
import Payment from "../../models/paymentModel.js";
import Refund from "../../models/refundModel.js";

export const deleteTicketAndRelatedData = async (ticketId) => {
  const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
  if (!deletedTicket) {
    return {
      status: 404,
      code: "ERROR-0002",
      message: "해당 티켓을 찾을 수 없습니다.",
    };
  }

  await User.updateMany(
    { tickets: ticketId },
    { $pull: { tickets: ticketId } }
  );

  await Payment.deleteMany({ ticketId });

  const relatedRefunds = await Refund.find({ ticketId });

  if (relatedRefunds.length > 0) {
    const refundIds = relatedRefunds.map((r) => r._id.toString());

    await User.updateMany(
      { refunds: { $in: refundIds } },
      { $pull: { refunds: { $in: refundIds } } }
    );

    await Refund.deleteMany({ _id: { $in: refundIds } });
  }

  return {
    status: 200,
    code: "SUCCESS-0001",
    message:
      "티켓이 성공적으로 삭제되었으며 관련 유저, 결제, 환불 정보도 정리되었습니다.",
    result: deletedTicket,
  };
};
