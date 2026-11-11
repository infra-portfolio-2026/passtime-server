import { modifyTicket } from "../../services/ticket/modifyTicketService.js";

export const modifyTicketController = async (req, res) => {
  try {
    const response = await modifyTicket(req.body, req.file, req);
    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result || [],
    });
  } catch (error) {
    console.error("❌ 티켓 수정 중 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류",
      result: [],
    });
  }
};
