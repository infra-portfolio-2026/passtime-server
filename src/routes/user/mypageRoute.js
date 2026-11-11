import express from "express";
import {
  getMyPage,
  getMyAffiliationRequestHistory,
  getMyParticipatedEventCount,
  getMyParticipatedEventList,
  updateAffiliation,
} from "../../controllers/user/mypageController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/mypage", authenticate, getMyPage);
router.get("/mypage/requests", authenticate, getMyAffiliationRequestHistory);
router.get("/mypage/events", authenticate, getMyParticipatedEventList);
router.get("/mypage/events/count", authenticate, getMyParticipatedEventCount);

export default router;
