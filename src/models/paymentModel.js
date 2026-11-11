import mongoose from "mongoose";
import db from "../config/db.js";

const paymentSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true },
    name: { type: String, required: true },
    studentId: { type: String, required: true },
    phone: { type: String, required: true },
    major: { type: String, required: true },
    paymentPicture: { type: String },
    paymentPermissionStatus: {
      type: Boolean,
      default: false,
    },
    pendingReminderSent: {
      type: Boolean,
      default: false,
    },
    aiReviewStatus: {
      type: String,
      enum: ["none", "reviewing", "auto_approved", "suspicious", "failed"],
      default: "none",
    },
    aiReview: {
      extractedAmount: Number,
      extractedDate: String,
      normalizedDate: String,
      extractedSenderName: String,
      extractedAccountHolderName: String,
      extractedCounterpartyName: String,
      isTransferScreenshot: Boolean,
      confidence: Number,
      ruleScore: Number,
      combinedConfidence: Number,
      reasons: [String],
      notes: [String],
      criteria: {
        announcementDate: String,
        participationFee: Number,
        accountHolderName: String,
      },
      reviewedAt: Date,
      model: String,
    },
    etc: String,
  },
  { timestamps: true }
);

const Payment = db.model("Payment", paymentSchema);

export default Payment;
