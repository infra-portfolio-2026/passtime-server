import { denyRefundRequest } from "../../services/refund/refundDenyService.js";

export const refundDenyController = async (req, res) => {
  const { refundId } = req.query;

  if (!refundId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0001",
      message: "필수 데이터가 누락되었습니다.",
      result: [],
    });
  }

  try {
    const refund = await denyRefundRequest(refundId);

    if (!refund) {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0002",
        message: "해당 환불 요청을 찾을 수 없습니다.",
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "환불 요청이 거부되었습니다.",
      result: {
        refundId: refund._id,
        refundPermissionStatus: refund.refundPermissionStatus,
      },
    });
  } catch (error) {
    console.error("❌ 서버 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "서버 오류",
      result: [],
    });
  }
};
