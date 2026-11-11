import express from "express";
import {
  paymentListController,
  paymentCountController,
} from "../../controllers/payment/paymentListController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/list", authenticate, paymentListController);
router.get("/count", authenticate, paymentCountController);

export default router;
