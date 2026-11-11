import { getTicketRefundDetail } from "../../services/ticket/ticketRefundDetailService.js";

export const ticketRefundDetailController = async (req, res) => {
  const { ticketId } = req.query;

  if (!ticketId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0000",
      message: "ticketId 쿼리 파라미터가 필요합니다.",
      result: [],
    });
  }

  try {
    const result = await getTicketRefundDetail(ticketId);

    if (result.error) {
      switch (result.error) {
        case "refund_not_found":
          return res.status(404).json({
            isSuccess: false,
            code: "ERROR-0001",
            message: "환불 내역이 없습니다.",
            result: [],
          });
        case "ticket_not_found":
          return res.status(404).json({
            isSuccess: false,
            code: "ERROR-0002",
            message: "티켓 정보를 찾을 수 없습니다.",
            result: [],
          });
        case "user_not_found":
          return res.status(404).json({
            isSuccess: false,
            code: "ERROR-0003",
            message: "유저 정보를 찾을 수 없습니다.",
            result: [],
          });
        default:
          return res.status(500).json({
            isSuccess: false,
            code: "ERROR-0004",
            message: "알 수 없는 오류",
            result: [],
          });
      }
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "환불 상세 정보를 가져왔습니다.",
      result,
    });
  } catch (error) {
    console.error("❌ 환불 상세 조회 중 오류 발생:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0004",
      message: "서버 오류",
      result: [],
    });
  }
};
