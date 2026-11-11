import { savePaymentData } from "../../services/payment/paymentPostService.js";

export const paymentPostController = async (req, res) => {
  try {
    const { name, studentId, major } = req.user;
    const { ticketId, phone } = req.body;

    if (!ticketId || !phone || !req.file) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0002",
        message: "필수 데이터가 누락되었습니다.",
        result: [],
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/paymentPictures/${
      req.file.filename
    }`;

    const result = await savePaymentData({
      ticketId,
      name,
      studentId,
      phone,
      major,
      imageUrl,
    });

    if (result.error === "ALREADY_APPROVED") {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0004",
        message: result.message,
        result: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: result.updated
        ? "납부내역이 수정되었습니다."
        : "납부내역이 성공적으로 저장되었습니다.",
      result,
    });
  } catch (error) {
    console.error("❌ 결제 저장 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0003",
      message: "서버 오류",
      result: [],
    });
  }
};
