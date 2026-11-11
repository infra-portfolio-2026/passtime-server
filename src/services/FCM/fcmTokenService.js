import User from "../../models/userModel.js";

export const saveFcmToken = async (studentId, fcmToken) => {
  const user = await User.findOne({ studentId });
  if (!user) return null;

  await User.updateMany(
    { fcmToken, _id: { $ne: user._id } },
    { $set: { fcmToken: null } }
  );

  user.fcmToken = fcmToken;
  await user.save();
  return user;
};
