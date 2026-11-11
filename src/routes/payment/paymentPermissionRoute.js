import express from "express";
import {
  paymentPermissionController,
  paymentApproveAllController,
} from "../../controllers/payment/paymentPermissionController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.put("/permission", paymentPermissionController);
router.put("/permission/all", authenticate, paymentApproveAllController);

export default router;
