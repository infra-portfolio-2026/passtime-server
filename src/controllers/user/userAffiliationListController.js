import { getAuthorizedAffiliationsByStudentId } from "../../services/user/userAffiliationListService.js";

export const getAuthorizedAffiliationList = async (req, res) => {
  try {
    const { studentId } = req.user;
    const result = await getAuthorizedAffiliationsByStudentId(studentId);

    return res.status(200).json({
      isSuccess: true,
      code: "SUCCESS-0000",
      message: "권한이 있는 소속 목록 조회 성공",
      result,
    });
  } catch (error) {
    console.error("❌ 권한 소속 목록 조회 오류:", error);
    return res.status(error.status || 500).json({
      isSuccess: false,
      code: "ERROR-9999",
      message: error.message || "서버 오류",
      result: { root: false, affiliations: [] },
    });
  }
};
