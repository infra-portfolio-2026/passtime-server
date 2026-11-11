import Refund from "../../models/refundModel.js";

export const denyRefundRequest = async (refundId) => {
  const refund = await Refund.findById(refundId);
  if (!refund) {
    return null;
  }

  refund.refundPermissionStatus = false;
  await refund.save();

  return refund;
};
