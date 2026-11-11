import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI;

const db = mongoose.createConnection(mongoURI);

export default db;
