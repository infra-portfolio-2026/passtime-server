import admin from "../../config/firebaseConfig.js";
import User from "../../models/userModel.js";

const sendAffiliationRequestResultNotification = async ({
  studentId,
  affiliationName,
  requestType,
  status,
  adminComment = "",
}) => {
  try {
    const user = await User.findOne({ studentId });
    if (!user || !user.fcmToken || !user.notification) {
      return;
    }

    const isCreateRequest = requestType === "create";
    const isApproved = status === "approved";

    let title;
    let body;

    if (isCreateRequest) {
      title = isApproved ? "소속 생성 승인" : "소속 생성 거절";
      body = isApproved
        ? `${affiliationName} 소속 생성 신청이 승인되었습니다.`
        : adminComment
          ? `${affiliationName} 소속 생성 신청이 거절되었습니다. 사유: ${adminComment}`
          : `${affiliationName} 소속 생성 신청이 거절되었습니다.`;
    } else {
      title = isApproved ? "주최자 권한 승인" : "주최자 권한 거절";
      body = isApproved
        ? `${affiliationName} 소속 주최자 권한 신청이 승인되었습니다.`
        : adminComment
          ? `${affiliationName} 소속 주최자 권한 신청이 거절되었습니다. 사유: ${adminComment}`
          : `${affiliationName} 소속 주최자 권한 신청이 거절되었습니다.`;
    }

    const message = {
      token: user.fcmToken,
      notification: { title, body },
      data: {
        type: isApproved
          ? "AFFILIATION_REQUEST_APPROVED"
          : "AFFILIATION_REQUEST_REJECTED",
        requestType: String(requestType),
        affiliationName: String(affiliationName),
        status: String(status),
        adminComment: String(adminComment || ""),
      },
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error("❌ 소속 신청 결과 알림 전송 실패:", error);
  }
};

export default sendAffiliationRequestResultNotification;
