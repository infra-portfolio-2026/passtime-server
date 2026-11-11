import { createTicket } from "../../services/ticket/createTicketService.js";

export const createTicketController = async (req, res) => {


  try {
    const response = await createTicket(req.body);

    return res.status(response.status).json({
      isSuccess: response.status === 201,
      code: response.code,
      message: response.message,
      result: response.result || [],
    });
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류",
      result: [],
    });
  }
};
