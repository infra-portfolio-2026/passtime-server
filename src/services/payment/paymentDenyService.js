import Payment from "../../models/paymentModel.js";

export const denyPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;

  payment.paymentPermissionStatus = false;
  await payment.save();

  return {
    paymentId: payment._id,
    paymentPermissionStatus: payment.paymentPermissionStatus,
  };
};
