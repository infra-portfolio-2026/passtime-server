import mongoose from "mongoose";
import db from "../config/db.js";

const participationHistorySchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    ticketId: { type: String, required: true },
    eventTitle: String,
    eventDay: String,
    eventStartTime: String,
    eventEndTime: String,
    eventPlace: String,
    eventPlaceComment: String,
    eventComment: String,
    eventCode: String,
    affiliation: String,
    kakaoPlace: {
      place_name: String,
      address_name: String,
      x: String,
      y: String,
    },
    status: String,
    participantCount: { type: Number, default: 0 },
    participatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

participationHistorySchema.index(
  { studentId: 1, ticketId: 1 },
  { unique: true }
);

const ParticipationHistory = db.model(
  "ParticipationHistory",
  participationHistorySchema
);

export default ParticipationHistory;
