import express from "express";
import { refundRequestController } from "../../controllers/refund/refundRequestController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/request", authenticate, refundRequestController);

export default router;
