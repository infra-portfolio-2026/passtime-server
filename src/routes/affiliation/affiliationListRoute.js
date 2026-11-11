import express from "express";
import { getAffiliationListController } from "../../controllers/affiliation/affiliationListController.js";

const router = express.Router();
router.get("/List", getAffiliationListController);

export default router;
