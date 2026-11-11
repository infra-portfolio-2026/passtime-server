import express from "express";
import { ticketDetailController } from "../../controllers/ticket/ticketDetailController.js";

const router = express.Router();
router.get("/detail", ticketDetailController);

export default router;
