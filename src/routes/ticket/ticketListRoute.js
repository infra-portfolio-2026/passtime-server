import express from "express";
import { ticketListController } from "../../controllers/ticket/ticketListController.js";

const router = express.Router();
router.get("/list", ticketListController);

export default router;
