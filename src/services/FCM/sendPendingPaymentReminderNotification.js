import moment from "moment-timezone";
import admin from "../../config/firebaseConfig.js";
import Payment from "../../models/paymentModel.js";
import Ticket from "../../models/ticketModel.js";
import { findAffiliationHostUsers } from "../../utils/affiliationHosts.js";

const PENDING_REMINDER_HOURS = 12;

/**
 * 12시간 이상 승인되지 않은 납부가 있는 행사의 권한자(소속장/임원)에게
 * 해당 행사의 현재 승인 대기 건수를 알립니다.
 * 각 납부 건은 12시간 경과 후 최초 1회만 알림 트리거가 됩니다.
 */
const sendPendingPaymentReminderNotification = async () => {
  try {
    const cutoff = moment()
      .tz("Asia/Seoul")
      .subtract(PENDING_REMINDER_HOURS, "hours")
      .toDate();

    const dueTriggers = await Payment.find({
      paymentPermissionStatus: false,
      pendingReminderSent: { $ne: true },
      createdAt: { $lte: cutoff },
    });

    if (dueTriggers.length === 0) {
      return;
    }

    const markTriggersHandled = () =>
      Payment.updateMany(
        { _id: { $in: dueTriggers.map((p) => p._id) } },
        { $set: { pendingReminderSent: true } }
      );

    const triggerTicketIds = [
      ...new Set(dueTriggers.map((p) => String(p.ticketId))),
    ];
    const triggerTickets = await Ticket.find({ _id: { $in: triggerTicketIds } });

    if (triggerTickets.length === 0) {
      await markTriggersHandled();
      return;
    }

    const pendingPayments = await Payment.find(
      {
        paymentPermissionStatus: false,
        ticketId: { $in: triggerTicketIds },
      },
      { ticketId: 1 }
    );

    const pendingCountByTicket = {};
    for (const payment of pendingPayments) {
      const ticketId = String(payment.ticketId);
      pendingCountByTicket[ticketId] =
        (pendingCountByTicket[ticketId] || 0) + 1;
    }

    for (const ticket of triggerTickets) {
      const ticketId = String(ticket._id);
      const count = pendingCountByTicket[ticketId] || 0;
      if (count < 1 || !ticket.affiliation) {
        continue;
      }

      const hosts = await findAffiliationHostUsers(ticket.affiliation);
      if (hosts.length === 0) {
        continue;
      }

      const title = "승인 대기 알림";
      const body = `${ticket.eventTitle}에 대한 승인 대기 ${count}건이 있습니다.`;

      const sentTokens = new Set();
      for (const host of hosts) {
        if (!host.fcmToken || sentTokens.has(host.fcmToken)) {
          continue;
        }
        sentTokens.add(host.fcmToken);

        const message = {
          token: host.fcmToken,
          notification: { title, body },
          data: {
            type: "PAYMENT_PENDING_REMINDER",
            affiliationName: String(ticket.affiliation),
            eventTitle: String(ticket.eventTitle || ""),
            ticketId,
            pendingCount: String(count),
          },
        };

        try {
          await admin.messaging().send(message);
        } catch (sendError) {
          console.error(
            `❌ 승인 대기 알림 전송 실패 (token: ${host.fcmToken}):`,
            sendError
          );
        }
      }
    }

    await markTriggersHandled();
  } catch (error) {
    console.error("❌ 승인 대기 알림 처리 실패:", error);
  }
};

export default sendPendingPaymentReminderNotification;
