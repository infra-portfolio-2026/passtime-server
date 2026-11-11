import User from "../models/userModel.js";
import { AFFILIATION_ROLES } from "./affiliationRole.js";

/**
 * 특정 소속의 소속장(leader)/임원(executive) 중
 * 알림 수신이 가능한(알림 허용 + FCM 토큰 보유) 사용자 목록을 반환합니다.
 * 레거시 데이터 호환을 위해 admin:true 도 함께 조회합니다.
 */
export const findAffiliationHostUsers = async (affiliationName) => {
  if (!affiliationName) {
    return [];
  }

  return User.find({
    notification: true,
    fcmToken: { $ne: null },
    affiliations: {
      $elemMatch: {
        name: affiliationName,
        $or: [
          {
            role: {
              $in: [AFFILIATION_ROLES.LEADER, AFFILIATION_ROLES.EXECUTIVE],
            },
          },
          { admin: true },
        ],
      },
    },
  });
};
