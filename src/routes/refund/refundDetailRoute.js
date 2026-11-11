import express from "express";
import { refundDetailController } from "../../controllers/refund/refundDetailController.js";

const router = express.Router();
router.get("/detail", refundDetailController);

export default router;
