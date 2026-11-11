import { getUserTicketsWithStatus } from "../../services/ticket/ticketMainService.js";

export const ticketMainController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const ticketStatuses = await getUserTicketsWithStatus(studentId);

    if (!ticketStatuses) {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "등록된 티켓 데이터가 없습니다.",
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "요청에 성공하였습니다.",
      result: ticketStatuses.map((ticket) => ({
        _id: ticket._id,
        eventTitle: ticket.eventTitle,
        eventDay: ticket.eventDay,
        eventStartTime: ticket.eventStartTime,
        eventEndTime: ticket.eventEndTime,
        eventPlace: ticket.eventPlace,
        status: ticket.status,
        affiliation: ticket.affiliation,
      })),
    });
  } catch (error) {
    console.error("❌ 티켓 조회 중 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0005",
      message: "서버 오류",
      result: [],
    });
  }
};
