import express from "express";
import { addFcmToken } from "../../controllers/FCM/fcmTokenAddController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/tokenAdd", authenticate, addFcmToken);

export default router;
