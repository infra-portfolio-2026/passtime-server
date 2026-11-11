import { getAdminTicketsWithStatus } from "../../services/ticket/ticketManageMainService.js";

export const getAdminTickets = async (req, res) => {
  try {
    const { studentId } = req.user;
    const tickets = await getAdminTicketsWithStatus(studentId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "관리 소속 티켓 조회 성공",
      result: (tickets || []).map((ticket) => ({
        _id: ticket._id,
        eventTitle: ticket.eventTitle,
        eventCode: ticket.eventCode,
        eventDay: ticket.eventDay,
        eventStartTime: ticket.eventStartTime,
        eventEndTime: ticket.eventEndTime,
        eventPlace: ticket.eventPlace,
        affiliation: ticket.affiliation,
        status: ticket.status,
        totalCount: ticket.totalCount,
        pendingCount: ticket.pendingCount,
        approvedCount: ticket.approvedCount,
        refundPendingCount: ticket.refundPendingCount,
      })),
    });
  } catch (error) {
    console.error("❌ 관리자 티켓 조회 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0005",
      message: "서버 오류로 티켓 조회 실패",
      result: [],
    });
  }
};
