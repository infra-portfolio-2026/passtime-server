import express from "express";
import {
  affiliationRequestListController,
  affiliationRequestDetailController,
} from "../../controllers/affiliation/affiliationRequestListController.js";

const router = express.Router();

router.get("/affiliationRequestsList", affiliationRequestListController);
router.get("/affiliationRequests/:id", affiliationRequestDetailController);

export default router;
