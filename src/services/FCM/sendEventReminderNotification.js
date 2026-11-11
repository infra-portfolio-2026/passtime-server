import moment from "moment-timezone";
import admin from "../../config/firebaseConfig.js";
import User from "../../models/userModel.js";
import Ticket from "../../models/ticketModel.js";
import { parseEventStartAt } from "../../utils/eventTime.js";
import { josaIGa } from "../../utils/koreanJosa.js";

const buildReminderKey = (ticket) =>
  `${ticket.eventTitle}|${String(ticket.eventDay).slice(0, 10)}|${ticket.eventStartTime}`;

export const sendEventReminderForUser = async (
  ticketId,
  userId,
  sentTokens = null
) => {
  const ticketIdStr = String(ticketId);
  const ticket = await Ticket.findById(ticketIdStr);

  if (!ticket) {
    return false;
  }

  const user = await User.findById(userId);
  if (!user?.fcmToken || user.notification !== true) {
    return false;
  }

  if (sentTokens?.has(user.fcmToken)) {
    return false;
  }

  const hasTicket = (user.tickets || []).some((id) => String(id) === ticketIdStr);
  if (!hasTicket) {
    return false;
  }

  const isExcluded = (user.eventReminderExcludedTickets || []).some(
    (id) => String(id) === ticketIdStr
  );
  if (isExcluded) {
    return false;
  }

  const reminderKey = buildReminderKey(ticket);
  const alreadySent = (user.eventRemindersSent || []).some(
    (id) => String(id) === ticketIdStr || String(id) === reminderKey
  );
  if (alreadySent) {
    return false;
  }

  const claimed = await User.findOneAndUpdate(
    {
      _id: user._id,
      eventRemindersSent: { $nin: [ticketIdStr, reminderKey] },
    },
    { $addToSet: { eventRemindersSent: { $each: [ticketIdStr, reminderKey] } } }
  );

  if (!claimed) {
    return false;
  }

  const message = {
    token: user.fcmToken,
    notification: {
      title: "이벤트 시작 1시간 전!",
      body: `${josaIGa(ticket.eventTitle)} 곧 시작됩니다. 준비하세요!`,
    },
    android: {
      notification: {
        tag: `event_reminder_${ticketIdStr}`,
      },
    },
    apns: {
      headers: {
        "apns-collapse-id": `event_reminder_${ticketIdStr}`,
      },
    },
    data: {
      type: "EVENT_REMINDER",
      userId: user._id.toString(),
      eventTitle: ticket.eventTitle,
      ticketId: ticketIdStr,
    },
  };

  try {
    await admin.messaging().send(message);
    sentTokens?.add(user.fcmToken);
    return true;
  } catch (sendError) {
    await User.updateOne(
      { _id: user._id },
      { $pull: { eventRemindersSent: { $in: [ticketIdStr, reminderKey] } } }
    );
    console.error(
      moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
      `❌ ${user.name} 알림 전송 실패:`,
      sendError
    );
    return false;
  }
};

export const checkAndSendReminderIfDue = async (ticketId, userId) => {
  const ticket = await Ticket.findById(String(ticketId));
  if (!ticket) return false;

  const now = moment().tz("Asia/Seoul");
  const eventStartDate = parseEventStartAt(
    ticket.eventDay,
    ticket.eventStartTime
  );

  if (!eventStartDate) {
    return false;
  }

  const diffMinutes = eventStartDate.diff(now, "minutes");
  if (diffMinutes <= 60 && diffMinutes > 0) {
    return sendEventReminderForUser(ticketId, userId);
  }

  return false;
};

const sendEventReminderNotification = async (eventId) => {
  const ticketIdStr = String(eventId);
  const users = await User.find({ tickets: ticketIdStr });
  const sentTokens = new Set();

  let sentCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    const sent = await sendEventReminderForUser(
      ticketIdStr,
      user._id,
      sentTokens
    );
    if (sent) {
      sentCount += 1;
    } else {
      skippedCount += 1;
    }
  }

  return { sentCount, skippedCount };
};

export default sendEventReminderNotification;
