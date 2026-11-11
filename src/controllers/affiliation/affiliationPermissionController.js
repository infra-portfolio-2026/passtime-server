import {
  delegateLeadership,
  getAffiliationMembersWithRoles,
  grantExecutivePermission,
  removeAffiliationMember,
  revokeExecutivePermission,
} from "../../services/affiliation/affiliationPermissionService.js";

const handlePermissionError = (res, error) => {
  console.error("❌ 소속 권한 처리 오류:", error);
  return res.status(error.status || 500).json({
    isSuccess: false,
    code: error.code || "ERROR-9999",
    message: error.message || "서버 오류",
    result: null,
  });
};

export const getAffiliationMembersController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId } = req.params;
    const result = await getAffiliationMembersWithRoles(studentId, affiliationId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "소속 멤버 목록 조회 성공",
      result,
    });
  } catch (error) {
    return handlePermissionError(res, error);
  }
};

export const grantExecutiveController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId, targetStudentId } = req.body;

    if (!affiliationId || !targetStudentId) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "affiliationId와 targetStudentId가 필요합니다.",
        result: null,
      });
    }

    const result = await grantExecutivePermission(
      studentId,
      affiliationId,
      targetStudentId
    );

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "임원 권한 부여가 완료되었습니다.",
      result,
    });
  } catch (error) {
    return handlePermissionError(res, error);
  }
};

export const revokeExecutiveController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId, targetStudentId } = req.body;

    if (!affiliationId || !targetStudentId) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "affiliationId와 targetStudentId가 필요합니다.",
        result: null,
      });
    }

    const result = await revokeExecutivePermission(
      studentId,
      affiliationId,
      targetStudentId
    );

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "임원 권한 회수가 완료되었습니다.",
      result,
    });
  } catch (error) {
    return handlePermissionError(res, error);
  }
};

export const delegateLeadershipController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId, targetStudentId } = req.body;

    if (!affiliationId || !targetStudentId) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "affiliationId와 targetStudentId가 필요합니다.",
        result: null,
      });
    }

    const result = await delegateLeadership(
      studentId,
      affiliationId,
      targetStudentId
    );

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "소속장 위임이 완료되었습니다.",
      result,
    });
  } catch (error) {
    return handlePermissionError(res, error);
  }
};

export const removeAffiliationMemberController = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { affiliationId, targetStudentId } = req.body;

    if (!affiliationId || !targetStudentId) {
      return res.status(400).json({
        isSuccess: false,
        code: "ERROR-0003",
        message: "affiliationId와 targetStudentId가 필요합니다.",
        result: null,
      });
    }

    const result = await removeAffiliationMember(
      studentId,
      affiliationId,
      targetStudentId
    );

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "소속 멤버 삭제 및 권한 해제가 완료되었습니다.",
      result,
    });
  } catch (error) {
    return handlePermissionError(res, error);
  }
};
