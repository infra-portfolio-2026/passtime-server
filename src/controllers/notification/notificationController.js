import { toggleNotificationSetting } from "../../services/notification/notificationService.js";

export const toggleNotification = async (req, res) => {
  try {
    const { studentId } = req.user;
    const updatedUser = await toggleNotificationSetting(studentId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "알림 설정이 전환되었습니다.",
      notification: updatedUser.notification,
    });
  } catch (error) {
    console.error("알림 설정 전환 중 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "서버 오류가 발생했습니다.",
    });
  }
};
