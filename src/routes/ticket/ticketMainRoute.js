import express from "express";
import { ticketMainController } from "../../controllers/ticket/ticketMainController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/main", authenticate, ticketMainController);

export default router;
