import {
  getAffiliationRequests,
  getAffiliationRequestById,
} from "../../services/affiliation/affiliationRequestListService.js";

export const affiliationRequestListController = async (req, res) => {
  try {
    const { status, requestType } = req.query;
    const response = await getAffiliationRequests(status, requestType);

    return res.status(response.status).json(response);
  } catch (error) {
    console.error("❌ affiliationRequestListController Error:", error);
    return res.status(500).json({
      status: 500,
      message: "서버 에러가 발생했습니다.",
      error: error.message,
    });
  }
};

export const affiliationRequestDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getAffiliationRequestById(id);

    return res.status(response.status).json(response);
  } catch (error) {
    console.error("❌ affiliationRequestDetailController Error:", error);
    return res.status(500).json({
      status: 500,
      message: "서버 에러가 발생했습니다.",
      error: error.message,
    });
  }
};
