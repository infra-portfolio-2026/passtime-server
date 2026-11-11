import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default_secret";

export const generateToken = (user) => {
  const payload = {
    id: user._id,
    studentId: user.studentId,
    isAdmin: user.root || false,
    sessionVersion: user.sessionVersion ?? 0,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid or Expired Token");
  }
};
