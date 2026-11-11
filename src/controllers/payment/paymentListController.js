import {
  getPaymentListByAdmin,
  getPaymentCountByAdmin,
} from "../../services/payment/paymentListService.js";

export const paymentListController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId } = req.query;
    const result = await getPaymentListByAdmin(studentId, affiliationId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "납부 내역 조회 성공",
      result: result || [],
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

export const paymentCountController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId } = req.query;
    const result = await getPaymentCountByAdmin(studentId, affiliationId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "납부 내역 전체 수 조회 성공",
      result,
    });
  } catch (error) {
    console.error("❌ 서버 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "서버 오류",
      result: { totalCount: 0, approvedCount: 0, pendingCount: 0 },
    });
  }
};
