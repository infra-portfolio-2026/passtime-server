import mongoose from "mongoose";
import db from "../config/db.js";

const ticketSchema = new mongoose.Schema(
  {
    eventTitle: String,
    eventDay: String,
    eventStartTime: String,
    eventEndTime: String,
    eventPlace: String,
    eventPlaceComment: String,
    eventComment: String,
    eventCode: String,
    status: String,
    affiliation: {
      type: String,
      required: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    kakaoPlace: {
      place_name: String,
      address_name: String,
      x: String,
      y: String,
    },
  },
  { timestamps: true }
);

const Ticket = db.model("Ticket", ticketSchema);

export default Ticket;
