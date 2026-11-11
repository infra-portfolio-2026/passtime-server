import express from "express";
import {
  paymentAiReviewController,
  paymentAiReviewBatchController,
} from "../../controllers/payment/paymentAiReviewController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/ai-review", authenticate, paymentAiReviewController);
router.post("/ai-review/batch", authenticate, paymentAiReviewBatchController);

export default router;
