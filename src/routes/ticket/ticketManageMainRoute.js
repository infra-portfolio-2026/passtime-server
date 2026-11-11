import express from "express";
import { getAdminTickets } from "../../controllers/ticket/ticketManageMainController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/manageList", authenticate, getAdminTickets);

export default router;
