import admin from "../../config/firebaseConfig.js";
import { findAffiliationHostUsers } from "../../utils/affiliationHosts.js";

const sendRefundRequestNotification = async ({
  affiliationName,
  eventTitle,
  requesterName,
}) => {
  try {
    if (!affiliationName) {
      return;
    }

    const hosts = await findAffiliationHostUsers(affiliationName);

    if (hosts.length === 0) {
      return;
    }

    const title = "새 환불 신청";
    const body = `${requesterName} 님이 ${eventTitle} 환불을 신청했습니다.`;

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
          type: "REFUND_REQUEST",
          affiliationName: String(affiliationName),
          eventTitle: String(eventTitle || ""),
          requesterName: String(requesterName || ""),
        },
      };

      try {
        await admin.messaging().send(message);
      } catch (sendError) {
        console.error(
          `❌ 환불 신청 알림 전송 실패 (token: ${host.fcmToken}):`,
          sendError
        );
      }
    }
  } catch (error) {
    console.error("❌ 환불 신청 알림 처리 실패:", error);
  }
};

export default sendRefundRequestNotification;
