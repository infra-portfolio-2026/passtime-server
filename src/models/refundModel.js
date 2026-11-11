import mongoose from "mongoose";
import db from "../config/db.js";

const refundSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true },
    name: { type: String, required: true },
    studentId: { type: String, required: true },
    major: { type: String, required: true },
    phone: { type: String, required: true },
    refundReason: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    visitDate: { type: String, required: true },
    visitTime: { type: String, required: true },
    refundPermissionStatus: { type: Boolean, default: false },
    refundApprovedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Refund = db.model("Refund", refundSchema);

export default Refund;
