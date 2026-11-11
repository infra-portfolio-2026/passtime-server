import express from "express";
import { getAuthorizedAffiliationList } from "../../controllers/user/userAffiliationListController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/affiliation/authorized", authenticate, getAuthorizedAffiliationList);

export default router;
