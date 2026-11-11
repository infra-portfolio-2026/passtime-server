import User from "../../models/userModel.js";

export const rootConnection = async (req, res) => {
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

    if (user.root === false) {
      return res.status(403).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "권한이 없습니다.",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "개발자 모드 접속이 확인되었습니다.",
    });
  } catch (error) {
    console.error(`❌ 관리자 인증 오류 - user: ${req.user?.studentId}`, error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0004",
      message: "서버 오류",
    });
  }
};
