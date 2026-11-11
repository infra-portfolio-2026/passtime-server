import { getNotificationStatusByStudentId } from "../../services/user/notificationStatusService.js";

export const getNotificationStatus = async (req, res) => {
  try {
    const { studentId } = req.user;
    const result = await getNotificationStatusByStudentId(studentId);

    return res.status(result.status).json({
      code: result.code,
      message: result.message,
      notification: result.notification,
    });
  } catch (error) {
    console.error("❌ 알림 상태 조회 중 오류:", error);
    return res.status(500).json({
      code: "ERROR-9999",
      message: "서버 오류",
      notification: null,
    });
  }
};
