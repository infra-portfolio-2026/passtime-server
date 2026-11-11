import { approveRefundAndNotify } from "../../services/refund/refundPermissionService.js";
import sendRefundNotification from "../../services/FCM/sendRefundNotificationService.js";

export const refundPermissionController = async (req, res) => {
  try {
    const { refundId } = req.query;

    const response = await approveRefundAndNotify(
      refundId,
      sendRefundNotification
    );

    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result || [],
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
