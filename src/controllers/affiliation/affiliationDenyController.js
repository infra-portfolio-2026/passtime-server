import { denyAffiliationRequest } from "../../services/affiliation/affiliationDenyService.js";

const handleDeny = async (req, res, expectedType, successMessage) => {
  try {
    if (!req.user?.root) {
      return res.status(403).json({
        code: "ERROR-0005",
        message: "root 관리자만 신청을 거절할 수 있습니다.",
      });
    }

    const { requestId } = req.query;
    const { comment } = req.body;

    if (!requestId) {
      return res.status(400).json({
        code: "ERROR-0001",
        message: "requestId가 필요합니다.",
      });
    }

    if (comment != null && typeof comment !== "string") {
      return res.status(400).json({
        code: "ERROR-0006",
        message: "comment는 문자열이어야 합니다.",
      });
    }

    const result = await denyAffiliationRequest(
      requestId,
      expectedType,
      comment || ""
    );

    if (result.error === "NOT_FOUND") {
      return res.status(404).json({
        code: "ERROR-0002",
        message: "해당 신청을 찾을 수 없습니다.",
      });
    }

    if (result.error === "ALREADY_PROCESSED") {
      return res.status(400).json({
        code: "ERROR-0003",
        message: "이미 처리된 신청입니다.",
      });
    }

    if (result.error === "INVALID_TYPE") {
      return res.status(400).json({
        code: "ERROR-0004",
        message: "신청 유형이 일치하지 않습니다.",
      });
    }

    return res.status(200).json({
      code: "SUCCESS-0000",
      message: successMessage,
      result,
    });
  } catch (err) {
    console.error("❌ 소속 신청 거절 중 오류:", err);
    return res.status(500).json({
      code: "ERROR-9999",
      message: "서버 오류가 발생했습니다.",
      error: err.message,
    });
  }
};

export const denyCreateAffiliationRequest = (req, res) =>
  handleDeny(req, res, "create", "소속 생성 신청이 거절되었습니다.");

export const denyAdminAffiliationRequest = (req, res) =>
  handleDeny(req, res, "admin", "주최자 권한 신청이 거절되었습니다.");
