import sendEventReminderNotification from "../../services/FCM/sendEventReminderNotification.js";

export const sendEventReminder = async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({
      isSuccess: false,
      code: "ERROR-0001",
      message: "eventId가 필요합니다.",
    });
  }

  try {
    await sendEventReminderNotification(eventId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "이벤트 알림 전송이 완료되었습니다.",
    });
  } catch (error) {
    console.error("❌ 이벤트 알림 전송 중 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류가 발생했습니다.",
    });
  }
};
