import { getTicketDetailById } from "../../services/ticket/modifyTicketDetailService.js";

export const modifyTicketDetailController = async (req, res) => {
  try {
    const { ticketId } = req.query;

    const response = await getTicketDetailById(ticketId);

    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result || [],
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
