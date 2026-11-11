import { getRefundListByAdmin } from "../../services/refund/refundListService.js";

export const refundListController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId } = req.query;
    const result = await getRefundListByAdmin(studentId, affiliationId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "환불 내역 조회 성공",
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
