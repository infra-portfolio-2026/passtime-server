import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new Error("로그인이 필요합니다.");
    }

    const secretKey = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secretKey);

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("유효하지 않은 유저");

    const currentVersion = user.sessionVersion ?? 0;
    if (
      decoded.sessionVersion === undefined ||
      decoded.sessionVersion !== currentVersion
    ) {
      throw new Error("다른 기기에서 로그인되어 세션이 만료되었습니다.");
    }

    req.user = {
      studentId: user.studentId,
      name: user.name,
      major: user.major,
      root: user.root,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      isSuccess: false,
      message: "인증 실패: " + error.message,
    });
  }
};
