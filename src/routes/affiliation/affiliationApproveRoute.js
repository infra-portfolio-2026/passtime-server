import express from "express";
import { approveAffiliationRequest } from "../../controllers/affiliation/affiliationApproveController.js";

const router = express.Router();
router.post("/approve", approveAffiliationRequest);

export default router;
