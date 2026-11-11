import express from "express";
import { sendTicketApprovalNotificationController } from "../../controllers/FCM/ticketApprovalController.js";

const router = express.Router();
router.post("/ticketApproval", sendTicketApprovalNotificationController);

export default router;
