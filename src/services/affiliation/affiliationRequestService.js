import AffiliationRequest from "../../models/affiliationRequestModel.js";
import User from "../../models/userModel.js";
import Affiliation from "../../models/affiliationModel.js";
import { hasHostPermission } from "../../utils/affiliationRole.js";

const mapRequestTypeToFlags = (requestType) => {
  if (requestType === "create") {
    return { createAffiliation: true, requestAdmin: true };
  }
  if (requestType === "admin") {
    return { createAffiliation: false, requestAdmin: true };
  }
  return null;
};

export const submitAffiliationRequest = async (requestData) => {
  const { studentId, affiliationName, requestType } = requestData;
  const flags = mapRequestTypeToFlags(requestType);

  if (!flags) {
    const error = new Error("유효하지 않은 신청 유형입니다.");
    error.code = "INVALID_REQUEST_TYPE";
    throw error;
  }

  const { createAffiliation, requestAdmin } = flags;

  const user = await User.findOne({ studentId });

  if (user && Array.isArray(user.affiliations)) {
    const existingAff = user.affiliations.find(
      (aff) => aff.name === affiliationName
    );

    if (requestType === "create" && existingAff && hasHostPermission(existingAff)) {
      const error = new Error("이미 해당 소속의 권한을 보유하고 있습니다.");
      error.code = "ALREADY_ADMIN";
      throw error;
    }

    if (requestType === "admin") {
      if (existingAff && hasHostPermission(existingAff)) {
        const error = new Error("이미 해당 소속의 권한을 보유하고 있습니다.");
        error.code = "ALREADY_ADMIN";
        throw error;
      }
    }
  }

  const existingRequest = await AffiliationRequest.findOne({
    studentId,
    affiliationName,
    requestType,
    status: "pending",
  });

  if (existingRequest) {
    const error = new Error("이미 동일한 유형으로 신청한 요청이 존재합니다.");
    error.code = "DUPLICATE_REQUEST";
    throw error;
  }

  const nameExistsInRequests = await AffiliationRequest.findOne({
    affiliationName,
    requestType: "create",
    status: "pending",
  });

  const nameExistsInAffiliations = await Affiliation.findOne({
    name: affiliationName,
  });

  if (requestType === "create") {
    if (nameExistsInRequests || nameExistsInAffiliations) {
      const error = new Error("이미 해당 소속명이 사용 중입니다.");
      error.code = "AFFILIATION_NAME_EXISTS";
      throw error;
    }
  }

  if (requestType === "admin") {
    if (!nameExistsInAffiliations) {
      const error = new Error(
        "해당 소속이 존재하지 않습니다. 관리자 권한 신청을 할 수 없습니다."
      );
      error.code = "AFFILIATION_NOT_FOUND";
      throw error;
    }
  }

  const newRequest = new AffiliationRequest({
    ...requestData,
    requestType,
    createAffiliation,
    requestAdmin,
    status: "pending",
  });

  return await newRequest.save();
};
