import mongoose from "mongoose";
import db from "../config/db.js";

const affiliationRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    major: { type: String, required: true },
    studentId: { type: String, required: true },
    phone: { type: String, required: true },
    affiliationName: { type: String, required: true },
    introduction: { type: String, default: "" },
    requestType: {
      type: String,
      enum: ["create", "admin"],
      required: true,
    },
    createAffiliation: { type: Boolean, required: true },
    requestAdmin: { type: Boolean, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminNotified: {
      type: Boolean,
      default: false,
    },

    adminComment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const AffiliationRequest = db.model(
  "AffiliationRequest",
  affiliationRequestSchema
);

export default AffiliationRequest;
