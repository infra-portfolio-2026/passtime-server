import admin from "../../config/firebaseConfig.js";
import User from "../../models/userModel.js";

const sendRefundNotification = async (userId, eventTitle = "") => {
  const user = await User.findById(userId);

  if (!user || !user.fcmToken || !user.notification) {
    return;
  }

  const body = eventTitle
    ? `${eventTitle}에 대한 환불이 승인되었습니다.`
    : "환불이 승인되었습니다.";

  const message = {
    token: user.fcmToken,
    notification: {
      title: "환불 승인 완료",
      body,
    },
    data: {
      type: "REFUND_APPROVED",
      userId: user._id.toString(),
    },
  };

  await admin.messaging().send(message);
};

export default sendRefundNotification;
