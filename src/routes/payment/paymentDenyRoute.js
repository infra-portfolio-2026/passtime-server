import express from "express";
import { paymentDenyController } from "../../controllers/payment/paymentDenyController.js";

const router = express.Router();
router.put("/deny", paymentDenyController);

export default router;
