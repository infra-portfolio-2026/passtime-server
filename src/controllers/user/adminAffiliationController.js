import { getAdminAffiliationsByStudentId } from "../../services/user/adminAffiliationService.js";

export const getMyAdminAffilliaions = async (req, res) => {
  try {
    const { studentId } = req.user;
    const adminAffiliations = await getAdminAffiliationsByStudentId(studentId);

    return res.status(200).json({
      success: true,
      affiliations: adminAffiliations,
    });
  } catch (error) {
    console.error("❌ 관리자 소속 조회 오류:", error);
    return res.status(500).json({ message: error.message || "서버 오류" });
  }
};
