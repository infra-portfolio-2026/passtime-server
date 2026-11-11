import { addTicketForUser } from "../../services/ticket/ticketAddService.js";

export const ticketAddController = async (req, res) => {
  try {
    const { eventCode } = req.body;
    const { studentId } = req.user;
    const response = await addTicketForUser(eventCode, studentId);

    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result || [],
    });
  } catch (error) {
    console.error("❌ 티켓 추가 중 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0006",
      message: "서버 오류 발생",
    });
  }
};
