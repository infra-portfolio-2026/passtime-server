import { createRefundRequest } from "../../services/refund/refundRequestService.js";

export const refundRequestController = async (req, res) => {
  try {
    const { name, studentId, major } = req.user;
    const userProfile = { name, studentId, major };
    const response = await createRefundRequest(userProfile, req.body);

    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result || [],
    });
  } catch (error) {
    console.error("환불 저장 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0004",
      message: "서버 오류",
      result: [],
    });
  }
};
