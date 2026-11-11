import { getPaymentDetail } from "../../services/payment/paymentDetailService.js";

export const paymentDetailController = async (req, res) => {
  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0001",
      message: "필수 데이터가 누락되었습니다.",
      result: [],
    });
  }

  try {
    const result = await getPaymentDetail(paymentId);

    if (!result) {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0002",
        message: "해당 납부 내역 또는 이벤트를 찾을 수 없습니다.",
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "요청에 성공하였습니다.",
      result,
    });
  } catch (error) {
    console.error("❌ 서버 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0004",
      message: "서버 오류",
      result: [],
    });
  }
};
