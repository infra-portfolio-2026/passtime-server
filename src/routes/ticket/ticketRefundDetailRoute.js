import express from "express";
import { ticketRefundDetailController } from "../../controllers/ticket/ticketRefundDetailController.js";

const router = express.Router();
router.get("/refundDetail", ticketRefundDetailController);

export default router;
