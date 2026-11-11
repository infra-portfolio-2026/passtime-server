import express from "express";
import { ticketAddNFCController } from "../../controllers/ticket/ticketAddNFCController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/addNFC", authenticate, ticketAddNFCController);

export default router;
