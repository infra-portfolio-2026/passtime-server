import sendRefundNotification from "../../services/FCM/sendRefundNotification.js";

export const sendRefundNotificationController = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0001",
      message: "userId가 필요합니다.",
    });
  }

  try {
    await sendRefundNotification(userId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "환불 승인 알림 전송이 완료되었습니다.",
    });
  } catch (error) {
    console.error("❌ 환불 승인 알림 전송 중 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류가 발생했습니다.",
    });
  }
};
