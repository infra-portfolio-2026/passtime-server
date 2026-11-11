import cron from "node-cron";
import moment from "moment-timezone";
import sendEventReminderNotification from "../services/FCM/sendEventReminderNotification.js";
import sendAdminAffiliationRequestNotification from "../services/FCM/sendAdminAffiliationRequestNotification.js";
import sendPendingPaymentReminderNotification from "../services/FCM/sendPendingPaymentReminderNotification.js";
import { parseEventStartAt } from "../utils/eventTime.js";
import { snapshotTicketParticipation } from "../services/user/participationHistoryService.js";
import Ticket from "../models/ticketModel.js";
import Refund from "../models/refundModel.js";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import AffiliationRequest from "../models/affiliationRequestModel.js";

const startCronJob = () => {
  cron.schedule("*/1 * * * *", async () => {
    const now = moment().tz("Asia/Seoul");
    const upcomingEvents = await Ticket.find();
    const processedEventKeys = new Set();

    for (const event of upcomingEvents) {
      const eventStartDate = parseEventStartAt(
        event.eventDay,
        event.eventStartTime
      );

      if (!eventStartDate) {
        continue;
      }

      const diffMinutes = eventStartDate.diff(now, "minutes");
      if (diffMinutes <= 60 && diffMinutes > 0) {
        const eventKey = `${event.eventTitle}|${String(event.eventDay).slice(0, 10)}|${event.eventStartTime}`;
        if (processedEventKeys.has(eventKey)) {
          continue;
        }
        processedEventKeys.add(eventKey);

        try {
          await sendEventReminderNotification(event._id);
        } catch (err) {
          console.error(
            now.format("YYYY-MM-DD HH:mm:ss"),
            `알림 전송 실패: ${event.eventTitle} - ${err.message}`
          );
        }
      }
    }
  });

  cron.schedule("*/1 * * * *", async () => {
    try {
      const pendingRequests = await AffiliationRequest.find({
        status: "pending",
        adminNotified: false,
      });

      for (const req of pendingRequests) {
        const rootUsers = await User.find({
          root: true,
          notification: true,
          fcmToken: { $ne: null },
        });

        if (rootUsers.length === 0) {
          continue;
        }

        const tokens = rootUsers.map((u) => u.fcmToken);

        await sendAdminAffiliationRequestNotification(tokens, req);

        req.adminNotified = true;
        await req.save();
      }
    } catch (err) {
      console.error("root 소속 신청 알림 처리 실패:", err);
    }
  });

  cron.schedule("0 * * * *", async () => {
    try {
      await sendPendingPaymentReminderNotification();
    } catch (err) {
      console.error(
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
        "승인 대기 알림 처리 실패:",
        err
      );
    }
  });

  cron.schedule("0 0 * * *", async () => {
    const now = moment().tz("Asia/Seoul");

    try {
      const allTickets = await Ticket.find();

      for (const ticket of allTickets) {
        const eventDate = moment
          .tz(String(ticket.eventDay).slice(0, 10), "YYYY-MM-DD", "Asia/Seoul")
          .startOf("day");

        if (!eventDate.isValid()) {
          continue;
        }

        const diffDays = now.clone().startOf("day").diff(eventDate, "days");

        if (diffDays >= 3) {
          const ticketId = ticket._id.toString();

          await snapshotTicketParticipation(ticket);

          await Refund.deleteMany({ ticketId: ticket._id });
          await Payment.deleteMany({ ticketId });
          await Ticket.deleteOne({ _id: ticket._id });

          await User.updateMany(
            { tickets: ticketId },
            { $pull: { tickets: ticketId } }
          );
        }
      }

      const refundCutoff = now.clone().subtract(2, "days").toDate();
      const oldApprovedRefunds = await Refund.find({
        refundPermissionStatus: true,
        refundApprovedAt: { $ne: null, $lte: refundCutoff },
      });

      for (const refund of oldApprovedRefunds) {
        const ticketId = String(refund.ticketId);
        await User.updateMany(
          { studentId: refund.studentId },
          { $pull: { tickets: ticketId } }
        );
      }

      const twoDaysAgo = now.clone().subtract(2, "days").startOf("day");
      const oldApprovedRequests = await AffiliationRequest.find({
        status: "approved",
        updatedAt: { $lte: twoDaysAgo.toDate() },
      });

      for (const req of oldApprovedRequests) {
        await AffiliationRequest.deleteOne({ _id: req._id });
      }
    } catch (err) {
      console.error(
        now.format("YYYY-MM-DD HH:mm:ss"),
        "만료 티켓/승인 요청 삭제 실패:",
        err
      );
    }
  });
};

export default startCronJob;
