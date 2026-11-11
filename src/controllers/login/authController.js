import { handleLogin } from "../../services/auth/authService.js";
import { generateToken } from "../../utils/jwt.js";

export const loginController = async (req, res) => {
  try {
    const user = await handleLogin(req.body);
    const accessToken = generateToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      isSuccess: true,
      message: "로그인 성공 (쿠키 발급)",
      result: {
        name: user.name,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    return res.status(401).json({
      isSuccess: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    });
  }
};
