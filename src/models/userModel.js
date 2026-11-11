import mongoose from "mongoose";
import db from "../config/db.js";

const userSchema = new mongoose.Schema(
  {
    name: String,
    studentId: String,
    major: String,
    gradeLevel: String,
    tickets: [String],
    refunds: [String],
    root: { type: Boolean, default: false },
    fcmToken: { type: String, default: null },
    affiliations: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliation" },
        name: String,
        admin: { type: Boolean, default: false },
        role: {
          type: String,
          enum: ["leader", "executive", "member"],
          default: "member",
        },
      },
    ],
    notification: { type: Boolean, default: true },
    eventRemindersSent: { type: [String], default: [] },
    eventReminderExcludedTickets: { type: [String], default: [] },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = db.model("User", userSchema);

export default User;
