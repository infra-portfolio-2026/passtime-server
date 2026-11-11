import express from "express";
import { postAffiliationRequest } from "../../controllers/affiliation/affiliationRequestController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/request", authenticate, postAffiliationRequest);

export default router;
