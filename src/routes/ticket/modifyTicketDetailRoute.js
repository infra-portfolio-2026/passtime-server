import express from "express";
import { modifyTicketDetailController } from "../../controllers/ticket/modifyTicketDetailController.js";

const router = express.Router();
router.get("/modifyTicketDetail", modifyTicketDetailController);

export default router;
