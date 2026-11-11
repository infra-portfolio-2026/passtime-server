import User from "../../models/userModel.js";

export const getNotificationStatusByStudentId = async (studentId) => {
  const user = await User.findOne({ studentId }).select("notification");

  if (!user) {
    return {
      status: 404,
      code: "ERROR-0003",
      message: "해당 사용자를 찾을 수 없습니다.",
      notification: null,
    };
  }

  return {
    status: 200,
    code: "SUCCESS-0000",
    message: "유저 알림 상태 조회 성공",
    notification: user.notification,
  };
};
