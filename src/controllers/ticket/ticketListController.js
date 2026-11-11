import { getTicketList } from "../../services/ticket/ticketListService.js";

export const ticketListController = async (req, res) => {
  try {
    const tickets = await getTicketList();

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "요청에 성공하였습니다.",
      result: tickets,
    });
  } catch (error) {
    console.error("❌ 티켓 리스트 조회 중 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류",
      result: [],
    });
  }
};
