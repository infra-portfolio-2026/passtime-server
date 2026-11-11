export const REQUEST_TYPE_LABELS = {
  create: "소속 생성",
  admin: "주최자 권한",
};

export const STATUS_LABELS = {
  pending: "승인 대기",
  approved: "승인됨",
  rejected: "거절됨",
};

export const resolveRequestType = (request) => {
  if (request.requestType) return request.requestType;
  return request.createAffiliation ? "create" : "admin";
};

export const formatAffiliationRequest = (request) => {
  const requestType = resolveRequestType(request);

  return {
    requestId: request._id,
    requestType,
    requestTypeLabel: REQUEST_TYPE_LABELS[requestType],
    name: request.name,
    major: request.major,
    studentId: request.studentId,
    phone: request.phone,
    affiliationName: request.affiliationName,
    introduction: request.introduction || "",
    status: request.status,
    statusLabel: STATUS_LABELS[request.status] || request.status,
    adminComment:
      request.status === "rejected" ? request.adminComment || "" : "",
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
};
