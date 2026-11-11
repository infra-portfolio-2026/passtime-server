import { getRefundDetail } from "../../services/refund/refundDetailService.js";

export const refundDetailController = async (req, res) => {
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
    const data = await getRefundDetail(refundId);

    if (!data) {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "해당 환불 요청을 찾을 수 없습니다.",
        result: [],
      });
    }

    const { refund, eventTitle } = data;

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "요청에 성공하였습니다.",
      result: {
        eventTitle,
        name: refund.name,
        studentId: refund.studentId,
        phone: refund.phone,
        refundReason: refund.refundReason,
        bankName: refund.bankName,
        accountNumber: refund.accountNumber,
        visitDate: refund.visitDate,
        visitTime: refund.visitTime,
        refundPermissionStatus: refund.refundPermissionStatus,
        major: refund.major,
      },
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
