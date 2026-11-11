import { getAllAffiliations } from "../../services/affiliation/affiliationListService.js";

export const getAffiliationListController = async (req, res) => {
  try {
    const response = await getAllAffiliations();
    return res.status(response.status).json({
      isSuccess: response.status === 200,
      code: response.code,
      message: response.message,
      result: response.result,
    });
  } catch (error) {
    console.error("❌ 소속 리스트 컨트롤러 오류:", error);
    return res.status(500).json({
      isSuccess: false,
      code: "ERROR-0002",
      message: "서버 오류",
      result: [],
    });
  }
};
