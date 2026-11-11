import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Payment from "../../models/paymentModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../../uploads/paymentPictures");

const deletePaymentPictureFile = async (paymentPictureUrl) => {
  if (!paymentPictureUrl) return;

  const marker = "/paymentPictures/";
  const markerIndex = paymentPictureUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const filename = decodeURIComponent(
    paymentPictureUrl.slice(markerIndex + marker.length).split("?")[0]
  );
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.unlink(filePath);
  } catch {
    // 이전 파일이 없어도 재제출은 계속 진행
  }
};

export const savePaymentData = async ({
  ticketId,
  name,
  studentId,
  phone,
  major,
  imageUrl,
}) => {
  const normalizedTicketId = String(ticketId);

  const existingPayment = await Payment.findOne({
    ticketId: normalizedTicketId,
    studentId,
  });

  if (existingPayment) {
    if (existingPayment.paymentPermissionStatus) {
      return {
        error: "ALREADY_APPROVED",
        message: "이미 승인된 행사가 있습니다.",
      };
    }

    const previousPicture = existingPayment.paymentPicture;

    existingPayment.phone = phone;
    existingPayment.major = major;
    existingPayment.name = name;
    existingPayment.paymentPicture = imageUrl;
    existingPayment.aiReviewStatus = "none";
    existingPayment.pendingReminderSent = false;
    existingPayment.set("aiReview", undefined);

    await existingPayment.save();

    if (previousPicture && previousPicture !== imageUrl) {
      await deletePaymentPictureFile(previousPicture);
    }

    return { ...existingPayment.toObject(), updated: true };
  }

  const newPayment = new Payment({
    ticketId: normalizedTicketId,
    name,
    studentId,
    phone,
    major,
    paymentPicture: imageUrl,
  });

  await newPayment.save();
  return { ...newPayment.toObject(), updated: false };
};
