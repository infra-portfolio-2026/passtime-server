import User from "../../models/userModel.js";

export const toggleNotificationSetting = async (studentId) => {
  const user = await User.findOne({ studentId });
  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  user.notification = !user.notification;
  await user.save();

  return user;
};
