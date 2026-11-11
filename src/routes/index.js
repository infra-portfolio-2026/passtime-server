import express from "express";

import authRouter from "./login/authRoute.js";

import ticketMainRoutes from "./ticket/ticketMainRoute.js";
import ticketDetailRoutes from "./ticket/ticketDetailRoute.js";
import createTicketRoutes from "./ticket/createTicketRoute.js";
import ticketAddRoute from "./ticket/ticketAddRoute.js";
import ticketAddNFCRoutes from "./ticket/ticketAddNFCRoute.js";
import ticketListRoutes from "./ticket/ticketListRoute.js";
import modifyTicketRoutes from "./ticket/modifyTicketRoute.js";
import ticketRefundDetailRoutes from "./ticket/ticketRefundDetailRoute.js";
import modifyTicketDetailRoutes from "./ticket/modifyTicketDetailRoute.js";
import ticketDeleteRoutes from "./ticket/ticketDeleteRoute.js";
import ticketManageMainRoutes from "./ticket/ticketManageMainRoute.js";

import refundRequestRoutes from "./refund/refundRequestRoute.js";
import refundListRoutes from "./refund/refundListRoute.js";
import refundDetailRoutes from "./refund/refundDetailRoute.js";
import refundPermissionRoutes from "./refund/refundPermissionRoute.js";
import refundDenyRoutes from "./refund/refundDenyRoute.js";

import paymentPostRoutes from "./payment/paymentPostRoute.js";
import paymentListRoutes from "./payment/paymentListRoute.js";
import paymentDetailRoutes from "./payment/paymentDetailRoute.js";
import paymentPermissionRoutes from "./payment/paymentPermissionRoute.js";
import paymentDenyRoutes from "./payment/paymentDenyRoute.js";
import paymentAiReviewRoutes from "./payment/paymentAiReviewRoute.js";

import mypageRoutes from "./user/mypageRoute.js";
import userAffiliationUpdate from "./user/userAffiliationUpdate.js";
import notificationStatusRoutes from "./user/notificationStatusRoute.js";
import adminAffilliationRoutes from "./user/adminAffilliationRoute.js";
import userAffiliationListRoute from "./user/userAffiliationListRoute.js";

import affiliationRequestRoutes from "./affiliation/affiliationRequestRoute.js";
import affiliationApproveRoutes from "./affiliation/affiliationApproveRoute.js";
import affiliationDenyRoutes from "./affiliation/affiliationDenyRoute.js";
import affiliationListRoutes from "./affiliation/affiliationListRoute.js";
import affiliationRequestsListRoute from "./affiliation/affiliationRequestsListRoute.js";
import affiliationPermissionRoute from "./affiliation/affiliationPermissionRoute.js";

import adminConnectionRoutes from "./admin/adminConnection.js";
import rootConnectionRoutes from "./root/rootConnection.js";

import notificationRoutes from "./notification/notificationRoute.js";
import fcmTokenRoutes from "./FCM/fcmTokenAddRoute.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/ticket", [
  ticketMainRoutes,
  ticketDetailRoutes,
  createTicketRoutes,
  ticketAddRoute,
  ticketAddNFCRoutes,
  ticketListRoutes,
  modifyTicketRoutes,
  ticketRefundDetailRoutes,
  modifyTicketDetailRoutes,
  ticketDeleteRoutes,
  ticketManageMainRoutes,
]);

router.use("/refund", [
  refundRequestRoutes,
  refundListRoutes,
  refundDetailRoutes,
  refundPermissionRoutes,
  refundDenyRoutes,
]);

router.use("/payment", [
  paymentPostRoutes,
  paymentListRoutes,
  paymentDetailRoutes,
  paymentPermissionRoutes,
  paymentDenyRoutes,
  paymentAiReviewRoutes,
]);

router.use("/user", [
  mypageRoutes,
  userAffiliationUpdate,
  notificationStatusRoutes,
  adminAffilliationRoutes,
  userAffiliationListRoute,
]);

router.use("/affiliation", [
  affiliationPermissionRoute,
  affiliationRequestRoutes,
  affiliationApproveRoutes,
  affiliationDenyRoutes,
  affiliationListRoutes,
  affiliationRequestsListRoute,
]);

router.use("/admin", adminConnectionRoutes);
router.use("/root", rootConnectionRoutes);

router.use("/notification", notificationRoutes);
router.use("/fcm", fcmTokenRoutes);

export default router;
