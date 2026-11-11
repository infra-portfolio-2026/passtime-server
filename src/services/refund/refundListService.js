import Refund from "../../models/refundModel.js";
import Ticket from "../../models/ticketModel.js";
import User from "../../models/userModel.js";
import Affiliation from "../../models/affiliationModel.js";
import {
  findUserAffiliation,
  hasHostPermission,
} from "../../utils/affiliationRole.js";

const getRefundsForAffiliationName = async (affiliationName) => {
  const tickets = await Ticket.find({ affiliation: affiliationName });

  if (!tickets.length) {
    return { refunds: [], tickets: [] };
  }

  const ticketIds = tickets.map((ticket) => ticket._id);
  const refunds = await Refund.find({ ticketId: { $in: ticketIds } });

  return { refunds, tickets };
};

export const getRefundListByAdmin = async (studentId, affiliationId) => {
  const user = await User.findOne({ studentId });
  if (!user) return [];

  let refunds = [];
  let tickets = [];

  if (affiliationId) {
    const affiliation = await Affiliation.findById(affiliationId);
    if (!affiliation) return [];

    if (user.root !== true) {
      const targetAffiliation = findUserAffiliation(user, affiliationId);

      if (!targetAffiliation || !hasHostPermission(targetAffiliation)) {
        return [];
      }
    }

    ({ refunds, tickets } = await getRefundsForAffiliationName(affiliation.name));
  } else if (user.root === true) {
    refunds = await Refund.find({});

    if (refunds.length > 0) {
      tickets = await Ticket.find({
        _id: { $in: refunds.map((refund) => refund.ticketId) },
      });
    }
  } else {
    const targetAffiliation = findUserAffiliation(user, affiliationId);

    if (!targetAffiliation || !hasHostPermission(targetAffiliation)) return [];

    ({ refunds, tickets } = await getRefundsForAffiliationName(
      targetAffiliation.name
    ));
  }

  return refunds.map((refund) => {
    const ticket = tickets.find((t) => t._id.equals(refund.ticketId));
    const eventName = ticket ? ticket.eventTitle : "이벤트 정보 없음";

    return {
      name: refund.name,
      studentId: refund.studentId,
      eventName,
      affiliation: ticket?.affiliation ?? null,
      visitDate: refund.visitDate,
      visitTime: refund.visitTime,
      refundPermissionStatus: refund.refundPermissionStatus ? "TRUE" : "FALSE",
      refundReason: refund.refundReason,
      _id: refund._id,
    };
  });
};
