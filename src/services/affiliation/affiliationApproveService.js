import AffiliationRequest from "../../models/affiliationRequestModel.js";
import User from "../../models/userModel.js";
import Affiliation from "../../models/affiliationModel.js";
import { countPrivilegedMembers } from "./affiliationPermissionService.js";
import sendAffiliationRequestResultNotification from "../FCM/sendAffiliationRequestResultNotification.js";
import {
  AFFILIATION_ROLES,
  MAX_PRIVILEGED_COUNT,
  applyAffiliationRole,
  hasHostPermission,
} from "../../utils/affiliationRole.js";

export const handleAffiliationApproval = async (requestId) => {
  const request = await AffiliationRequest.findById(requestId);
  if (!request) throw new Error("해당 요청을 찾을 수 없습니다.");
  if (request.status !== "pending") throw new Error("이미 처리된 요청입니다.");

  request.status = "approved";
  await request.save();

  const user = await User.findOne({ studentId: request.studentId });
  if (!user) throw new Error("해당 유저를 찾을 수 없습니다.");

  const affiliationName = request.affiliationName;
  let affiliationDoc;

  const isCreateRequest =
    request.requestType === "create" || request.createAffiliation;

  if (isCreateRequest) {
    affiliationDoc = await Affiliation.findOne({ name: affiliationName });
    if (!affiliationDoc) {
      affiliationDoc = await Affiliation.create({
        name: affiliationName,
        introduction: request.introduction || "",
        membersCount: 1,
        members: [user._id],
      });
    } else {
      if (!affiliationDoc.members.includes(user._id)) {
        affiliationDoc.members.push(user._id);
        affiliationDoc.membersCount = affiliationDoc.members.length;
        await affiliationDoc.save();
      }
    }
  } else {
    affiliationDoc = await Affiliation.findOne({ name: affiliationName });
    if (!affiliationDoc) throw new Error("소속을 찾을 수 없습니다.");
    if (!affiliationDoc.members.includes(user._id)) {
      affiliationDoc.members.push(user._id);
      affiliationDoc.membersCount = affiliationDoc.members.length;
      await affiliationDoc.save();
    }
  }

  if (!Array.isArray(user.affiliations)) user.affiliations = [];

  const existingAff = user.affiliations.find((a) => a.name === affiliationName);
  const assignedRole = isCreateRequest
    ? AFFILIATION_ROLES.LEADER
    : AFFILIATION_ROLES.EXECUTIVE;

  if (!isCreateRequest) {
    const privilegedCount = await countPrivilegedMembers(
      affiliationDoc._id,
      affiliationName
    );

    if (privilegedCount >= MAX_PRIVILEGED_COUNT) {
      throw new Error(
        `소속 권한 인원은 최대 ${MAX_PRIVILEGED_COUNT}명까지 가능합니다.`
      );
    }
  }

  if (!existingAff) {
    const newAffiliationRef = {
      _id: affiliationDoc._id,
      name: affiliationName,
    };
    applyAffiliationRole(newAffiliationRef, assignedRole);
    user.affiliations.push(newAffiliationRef);
  } else if (request.requestAdmin) {
    applyAffiliationRole(existingAff, assignedRole);
    user.markModified("affiliations");
  }

  await user.save();

  const updatedAff = user.affiliations.find((a) => a.name === affiliationName);
  const requestType = request.requestType || (isCreateRequest ? "create" : "admin");

  await sendAffiliationRequestResultNotification({
    studentId: request.studentId,
    affiliationName,
    requestType,
    status: "approved",
  });

  return {
    message:
      request.requestType === "admin"
        ? "임원 권한 승인이 완료되었습니다."
        : "소속 생성 승인이 완료되었습니다.",
    requestType,
    userId: user._id,
    updatedAffiliations: user.affiliations,
    role: updatedAff?.role || AFFILIATION_ROLES.MEMBER,
    isAdmin: hasHostPermission(updatedAff),
  };
};
