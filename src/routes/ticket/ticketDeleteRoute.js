import express from "express";
import { ticketDeleteController } from "../../controllers/ticket/ticketDeleteController.js";

const router = express.Router();
router.put("/delete", ticketDeleteController);

export default router;
