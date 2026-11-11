import User from "../../models/userModel.js";
import { hasHostPermission } from "../../utils/affiliationRole.js";

export const adminConnection = async (req, res) => {
  try {
    const { studentId } = req.user;

    const user = await User.findOne({ studentId });

    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        code: "ERROR-0002",
        message: "해당 사용자를 찾을 수 없습니다.",
      });
    }

    const hasAnyAdminRole =
      user.root === true ||
      (Array.isArray(user.affiliations) &&
        user.affiliations.some((aff) => hasHostPermission(aff)));

    if (!hasAnyAdminRole) {
      return res.status(403).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "권한이 없습니다.",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "관리자 모드 접속이 확인되었습니다.",
    });
  } catch (error) {
    console.error("❌ adminConnection 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0004",
      message: "서버 오류",
    });
  }
};
