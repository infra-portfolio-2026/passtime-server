import express from "express";
import { refundPermissionController } from "../../controllers/refund/refundPermissionController.js";

const router = express.Router();
router.put("/permission", refundPermissionController);

export default router;
