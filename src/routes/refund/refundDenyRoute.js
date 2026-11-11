import express from "express";
import { refundDenyController } from "../../controllers/refund/refundDenyController.js";

const router = express.Router();
router.put("/deny", refundDenyController);

export default router;
