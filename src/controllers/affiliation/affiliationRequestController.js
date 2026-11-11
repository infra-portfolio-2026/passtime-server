import { submitAffiliationRequest } from "../../services/affiliation/affiliationRequestService.js";
import { formatAffiliationRequest } from "../../services/affiliation/affiliationRequestFormatter.js";

const REQUEST_TYPE_LABELS = {
  create: "소속 생성",
  admin: "관리자 권한",
};

export const postAffiliationRequest = async (req, res) => {
  try {
    const { name, major, studentId } = req.user;
    const { phone, affiliationName, requestType, introduction } = req.body;

    if (!phone || !affiliationName || !requestType) {
      return res.status(400).json({
        code: "ERROR-0003",
        message: "필수 항목이 누락되었습니다.",
      });
    }

    if (!["create", "admin"].includes(requestType)) {
      return res.status(400).json({
        code: "ERROR-0004",
        message: "requestType은 create 또는 admin 이어야 합니다.",
      });
    }

    if (introduction != null && typeof introduction !== "string") {
      return res.status(400).json({
        code: "ERROR-0005",
        message: "introduction은 문자열이어야 합니다.",
      });
    }

    const requestData = {
      name,
      major,
      studentId,
      phone,
      affiliationName,
      requestType,
      introduction:
        requestType === "create" ? (introduction || "").trim() : "",
    };

    const saved = await submitAffiliationRequest(requestData);

    return res.status(201).json({
      code: "SUCCESS-0000",
      message: `${REQUEST_TYPE_LABELS[requestType]} 신청이 완료되었습니다.`,
      result: formatAffiliationRequest(saved),
    });
  } catch (err) {
    console.error("❌ 소속 신청 중 오류:", err);

    if (err.code === "INVALID_REQUEST_TYPE") {
      return res.status(400).json({ code: err.code, message: err.message });
    }
    if (err.code === "ALREADY_ADMIN") {
      return res.status(400).json({ code: err.code, message: err.message });
    }
    if (err.code === "DUPLICATE_REQUEST") {
      return res.status(400).json({ code: err.code, message: err.message });
    }
    if (err.code === "AFFILIATION_NAME_EXISTS") {
      return res.status(400).json({ code: err.code, message: err.message });
    }
    if (err.code === "AFFILIATION_NOT_FOUND") {
      return res.status(404).json({ code: err.code, message: err.message });
    }

    return res.status(500).json({
      code: "ERROR-9999",
      message: "서버 오류가 발생했습니다.",
    });
  }
};
