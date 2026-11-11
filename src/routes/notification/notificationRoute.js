import express from "express";
import { toggleNotification } from "../../controllers/notification/notificationController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.patch("/toggle", authenticate, toggleNotification);

export default router;
