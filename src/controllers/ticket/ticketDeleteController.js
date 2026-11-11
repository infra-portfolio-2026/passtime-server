import { deleteTicketAndRelatedData } from "../../services/ticket/ticketDeleteService.js";

export const ticketDeleteController = async (req, res) => {
  const { ticketId } = req.body;

  if (!ticketId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0001",
      message: "ticketId가 요청 바디에 없습니다.",
    });
  }

  try {
    const response = await deleteTicketAndRelatedData(ticketId);
    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result || [],
    });
  } catch (error) {
    console.error("❌ 티켓 삭제 중 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "서버 오류 발생",
    });
  }
};
