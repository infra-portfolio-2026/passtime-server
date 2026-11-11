import moment from "moment-timezone";

export const parseEventStartAt = (eventDay, eventStartTime) => {
  const day = String(eventDay).slice(0, 10);
  const time = String(eventStartTime || "").trim();

  if (!day || !time) return null;

  const normalizedTime =
    time.length === 5 ? `${time}:00` : time.length === 8 ? time : `${time}:00`;

  const parsed = moment.tz(
    `${day} ${normalizedTime}`,
    "YYYY-MM-DD HH:mm:ss",
    "Asia/Seoul"
  );

  return parsed.isValid() ? parsed : null;
};
