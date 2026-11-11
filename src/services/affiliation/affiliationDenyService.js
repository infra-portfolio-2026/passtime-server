import AffiliationRequest from "../../models/affiliationRequestModel.js";
import sendAffiliationRequestResultNotification from "../FCM/sendAffiliationRequestResultNotification.js";

const resolveRequestType = (request) => {
  if (request.requestType) return request.requestType;
  return request.createAffiliation ? "create" : "admin";
};

export const denyAffiliationRequest = async (
  requestId,
  expectedType,
  adminComment = ""
) => {
  const request = await AffiliationRequest.findById(requestId);
  if (!request) return { error: "NOT_FOUND" };

  if (request.status !== "pending") {
    return { error: "ALREADY_PROCESSED" };
  }

  const requestType = resolveRequestType(request);
  if (requestType !== expectedType) {
    return { error: "INVALID_TYPE" };
  }

  request.status = "rejected";
  request.adminComment = adminComment.trim();
  await request.save();

  await sendAffiliationRequestResultNotification({
    studentId: request.studentId,
    affiliationName: request.affiliationName,
    requestType,
    status: "rejected",
    adminComment: request.adminComment,
  });

  return {
    requestId: request._id,
    requestType,
    affiliationName: request.affiliationName,
    studentId: request.studentId,
    adminComment: request.adminComment,
    status: request.status,
  };
};
