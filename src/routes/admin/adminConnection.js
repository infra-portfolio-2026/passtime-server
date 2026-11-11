import express from "express";
import { adminConnection } from "../../controllers/admin/adminConnectionController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/connection", authenticate, adminConnection);

export default router;
