import express from "express";
import { getNotificationStatus } from "../../controllers/user/notificationStatusController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/setting", authenticate, getNotificationStatus);

export default router;
