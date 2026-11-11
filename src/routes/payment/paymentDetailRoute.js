import express from "express";
import { paymentDetailController } from "../../controllers/payment/paymentDetailController.js";

const router = express.Router();
router.get("/detail", paymentDetailController);

export default router;
