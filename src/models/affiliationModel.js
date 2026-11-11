import mongoose from "mongoose";
import db from "../config/db.js";

const affiliationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    introduction: { type: String, default: "" },
    membersCount: { type: Number, default: 0 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Affiliation = db.model("Affiliation", affiliationSchema);

export default Affiliation;
