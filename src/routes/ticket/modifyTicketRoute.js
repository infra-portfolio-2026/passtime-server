import express from "express";
import { modifyTicketController } from "../../controllers/ticket/modifyTicketController.js";

const router = express.Router();
router.put("/modifyTicket", modifyTicketController);

export default router;
