import ParticipationHistory from "../../models/participationHistoryModel.js";
import User from "../../models/userModel.js";
import { getTicketStatus } from "../ticket/ticketMainService.js";
import { countPaymentsByTicketIds } from "../payment/paymentCountService.js";

const PARTICIPATED_STATUSES = new Set(["사용 가능", "만료됨"]);

export const snapshotTicketParticipation = async (ticket) => {
  const ticketId = ticket._id.toString();

  const users = await User.find({ tickets: ticketId }, { studentId: 1 });
  if (!users.length) {
    return 0;
  }

  const countMap = await countPaymentsByTicketIds([ticketId]);
  const participantCount = countMap[ticketId]?.totalCount ?? 0;

  let saved = 0;

  for (const user of users) {
    const status = await getTicketStatus(ticket._id, user.studentId);
    if (!PARTICIPATED_STATUSES.has(status)) {
      continue;
    }

    await ParticipationHistory.updateOne(
      { studentId: user.studentId, ticketId },
      {
        $set: {
          studentId: user.studentId,
          ticketId,
          eventTitle: ticket.eventTitle,
          eventDay: ticket.eventDay,
          eventStartTime: ticket.eventStartTime,
          eventEndTime: ticket.eventEndTime,
          eventPlace: ticket.eventPlace,
          eventPlaceComment: ticket.eventPlaceComment,
          eventComment: ticket.eventComment,
          eventCode: ticket.eventCode,
          affiliation: ticket.affiliation,
          kakaoPlace: ticket.kakaoPlace,
          status,
          participantCount,
          participatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    saved += 1;
  }

  return saved;
};
