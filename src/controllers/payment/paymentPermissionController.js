import {
  approvePayment,
  approveAllPayments,
} from "../../services/payment/paymentPermissionService.js";

export const paymentPermissionController = async (req, res) => {
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
    const result = await approvePayment(paymentId);

    if (result.error === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "해당 결제 정보를 찾을 수 없습니다.",
        result: [],
      });
    }

    if (result.error === "USER_NOT_FOUND") {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0004",
        message: "해당 유저 정보를 찾을 수 없습니다.",
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message:
        "결제 승인 상태가 성공적으로 변경되었고, 유저 티켓에 추가되었습니다.",
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

export const paymentApproveAllController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId } = req.query;
    const result = await approveAllPayments(studentId, affiliationId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "전체 납부 내역 수락이 완료되었습니다.",
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
