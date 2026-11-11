import express from "express";
import { sendEventReminder } from "../../controllers/FCM/fcmNotificationController.js";

const router = express.Router();

router.post("/eventReminder", sendEventReminder);

export default router;
