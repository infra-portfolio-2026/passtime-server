import express from "express";
import { getMyAdminAffilliaions } from "../../controllers/user/adminAffiliationController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/adminAffilliation/list", authenticate, getMyAdminAffilliaions);

export default router;
