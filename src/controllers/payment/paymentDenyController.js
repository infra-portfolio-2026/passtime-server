import { denyPayment } from "../../services/payment/paymentDenyService.js";

export const paymentDenyController = async (req, res) => {
  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0001",
      message: "paymentId가 누락되었습니다.",
      result: [],
    });
  }

  try {
    const result = await denyPayment(paymentId);

    if (!result) {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "해당 결제 정보를 찾을 수 없습니다.",
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "결제 승인 상태가 성공적으로 변경되었습니다.",
      result,
    });
  } catch (error) {
    console.error("❌ 서버 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류",
      result: [],
    });
  }
};
