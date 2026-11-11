import moment from "moment-timezone";
import admin from "../../config/firebaseConfig.js";

const sendAdminAffiliationRequestNotification = async (tokens, request) => {
  try {
    if (!tokens || tokens.length === 0) {
      return;
    }

    for (const token of tokens) {
      const isCreateRequest = request.requestType === "create";
      const title = isCreateRequest
        ? "새 소속 생성 신청"
        : "소속 관리자 권한 신청";
      const body = isCreateRequest
        ? `${request.name} 님이 ${request.affiliationName} 소속 생성을 신청했습니다.`
        : `${request.name} 님이 ${request.affiliationName} 소속의 관리자 권한을 신청했습니다.`;

      const message = {
        token: token,
        notification: {
          title,
          body,
        },
        data: {
          type: "AFFILIATION_REQUEST",
          requestType: String(request.requestType || "create"),
          requestId: String(request._id),
          userName: String(request.name),
          affiliation: String(request.affiliationName),
        },
      };

      try {
        await admin.messaging().send(message);
      } catch (sendError) {
        console.error(
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
          `❌ 토큰 ${token} 알림 전송 실패:`,
          sendError
        );
      }
    }
  } catch (error) {
    console.error(
      moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
      "❌ 소속 신청 알림 전송 실패:",
      error
    );
    throw error;
  }
};

export default sendAdminAffiliationRequestNotification;
