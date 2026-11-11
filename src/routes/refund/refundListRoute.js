import express from "express";
import { refundListController } from "../../controllers/refund/refundListController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/list", authenticate, refundListController);

export default router;
