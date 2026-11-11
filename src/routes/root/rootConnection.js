import express from "express";
import { rootConnection } from "../../controllers/root/rootConnectionController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/connection", authenticate, rootConnection);

export default router;
