import express from "express";
import { createTicketController } from "../../controllers/ticket/createTicketController.js";

const router = express.Router();
router.post("/createTicket", createTicketController);

export default router;
