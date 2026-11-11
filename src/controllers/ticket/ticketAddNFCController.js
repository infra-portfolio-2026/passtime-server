import { addTicketByNFC } from "../../services/ticket/ticketAddNFCService.js";

export const ticketAddNFCController = async (req, res) => {
  const { eventCode } = req.body;

  if (!eventCode) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "eventCode가 누락되었습니다.",
    });
  }

  try {
    const { name, studentId, major } = req.user;
    const userProfile = { name, studentId, major };
    const response = await addTicketByNFC(userProfile, eventCode);

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
