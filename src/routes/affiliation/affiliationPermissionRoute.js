import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  delegateLeadershipController,
  getAffiliationMembersController,
  grantExecutiveController,
  removeAffiliationMemberController,
  revokeExecutiveController,
} from "../../controllers/affiliation/affiliationPermissionController.js";

const router = express.Router();

router.get("/members/:affiliationId", authenticate, getAffiliationMembersController);
router.post("/permission/grant", authenticate, grantExecutiveController);
router.post("/permission/revoke", authenticate, revokeExecutiveController);
router.post("/permission/delegate", authenticate, delegateLeadershipController);
router.post("/members/remove", authenticate, removeAffiliationMemberController);

export default router;
