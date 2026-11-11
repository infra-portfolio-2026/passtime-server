import sendTicketApprovalNotification from "../../services/FCM/sendTicketApprovalNotification.js";

export const sendTicketApprovalNotificationController = async (req, res) => {
  const { userId, eventTitle } = req.body;

  if (!userId || !eventTitle) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0001",
      message: "userId와 eventTitle이 모두 필요합니다.",
    });
  }

  try {
    await sendTicketApprovalNotification(userId, eventTitle);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "티켓 승인 알림 전송이 완료되었습니다.",
    });
  } catch (error) {
    console.error("❌ 티켓 승인 알림 전송 중 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류가 발생했습니다.",
    });
  }
};
