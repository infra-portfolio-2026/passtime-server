import AffiliationRequest from "../../models/affiliationRequestModel.js";
import { formatAffiliationRequest } from "./affiliationRequestFormatter.js";

export const getMyAffiliationRequests = async (studentId) => {
  const requests = await AffiliationRequest.find({ studentId }).sort({
    createdAt: -1,
  });

  const formatted = requests.map(formatAffiliationRequest);

  const latestCreate = formatted.find((r) => r.requestType === "create") || null;
  const latestAdmin = formatted.find((r) => r.requestType === "admin") || null;

  return {
    hasCreateRequest: formatted.some((r) => r.requestType === "create"),
    hasAdminRequest: formatted.some((r) => r.requestType === "admin"),
    hasPendingCreate: formatted.some(
      (r) => r.requestType === "create" && r.status === "pending"
    ),
    hasPendingAdmin: formatted.some(
      (r) => r.requestType === "admin" && r.status === "pending"
    ),
    latestCreateRequest: latestCreate,
    latestAdminRequest: latestAdmin,
    requests: formatted,
  };
};
