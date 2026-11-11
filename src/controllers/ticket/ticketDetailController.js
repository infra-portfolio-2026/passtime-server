import { getTicketDetail } from "../../services/ticket/ticketDetailService.js";

export const ticketDetailController = async (req, res) => {
  const ticketId = req.query.ticketId;

  if (!ticketId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "티켓 ID가 누락되었습니다.",
      result: [],
    });
  }

  try {
    const response = await getTicketDetail(ticketId);
    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result,
    });
  } catch (error) {
    console.error("❌ 티켓 조회 중 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류",
      result: [],
    });
  }
};
