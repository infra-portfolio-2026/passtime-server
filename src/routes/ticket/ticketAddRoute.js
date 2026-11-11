import express from "express";
import { ticketAddController } from "../../controllers/ticket/ticketAddController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/add", authenticate, ticketAddController);

export default router;
