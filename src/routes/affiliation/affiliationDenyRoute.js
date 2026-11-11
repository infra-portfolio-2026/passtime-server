import express from "express";
import {
  denyCreateAffiliationRequest,
  denyAdminAffiliationRequest,
} from "../../controllers/affiliation/affiliationDenyController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/deny/create", authenticate, denyCreateAffiliationRequest);
router.post("/deny/admin", authenticate, denyAdminAffiliationRequest);

export default router;
