import express from "express";
import { sendRefundNotificationController } from "../../controllers/FCM/refundNotificationController.js";

const router = express.Router();
router.post("/refundNotification", sendRefundNotificationController);

export default router;
