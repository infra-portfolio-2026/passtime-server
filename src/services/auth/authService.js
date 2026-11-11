import SchoolAuthService from "../authService.js";
import VerifySSOService from "../ssoAuth.js";
import User from "../../models/userModel.js";

export const handleLogin = async ({ userId, password }) => {
  try {
    const ssotoken = await SchoolAuthService.getSsotoken(userId, password);
    const profile = await VerifySSOService.verifySSOToken(ssotoken);

    const user = await User.findOneAndUpdate(
      { studentId: profile.studentId },
      {
        $set: {
          name: profile.name,
          major: profile.major,
          gradeLevel: profile.gradeLevel,
        },
        $setOnInsert: {
          tickets: [],
          refunds: [],
          root: false,
          notification: true,
        },
        $inc: { sessionVersion: 1 },
      },
      { new: true, upsert: true }
    );

    return user;
  } catch (error) {
    console.error("❌ 로그인 프로세스 실패:", error.message);
    throw error;
  }
};
