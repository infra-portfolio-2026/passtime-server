const normalizeName = (name) =>
  String(name ?? "")
    .replace(/\s/g, "")
    .trim();

export const maskedNameMatches = (expected, detected) => {
  const e = normalizeName(expected);
  const d = normalizeName(detected);

  if (!e || !d) return false;
  if (e === d) return true;

  if (d.includes("*")) {
    const pattern = `^${d[0]}.*${d[d.length - 1]}$`;
    return new RegExp(pattern).test(e);
  }

  if (e.includes("*")) {
    const pattern = `^${e[0]}.*${e[e.length - 1]}$`;
    return new RegExp(pattern).test(d);
  }

  return e.includes(d) || d.includes(e);
};

export const normalizeExtractedDate = (dateValue, announcementDate) => {
  if (!dateValue) return null;

  const str = String(dateValue).trim().replace(/\./g, "-");

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const shortMatch = str.match(/^(\d{1,2})-(\d{1,2})$/);
  if (shortMatch) {
    const year =
      announcementDate?.slice(0, 4) || String(new Date().getFullYear());
    const month = shortMatch[1].padStart(2, "0");
    const day = shortMatch[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return str.slice(0, 10);
};

const parseDate = (value) => {
  if (!value) return null;
  const normalized = String(value).replace(/\./g, "-").slice(0, 10);
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isDateOnOrAfter = (dateValue, minDateValue) => {
  const date = parseDate(dateValue);
  const minDate = parseDate(minDateValue);
  if (!date || !minDate) return false;
  return date >= minDate;
};

export const isDateInFuture = (dateValue) => {
  const date = parseDate(dateValue);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

export const evaluatePaymentReview = ({
  criteria,
  payment,
  extracted,
  aiConfidence,
}) => {
  const reasons = [];
  const notes = [];
  let ruleScore = 0;

  const normalizedDate = normalizeExtractedDate(
    extracted.date,
    criteria.announcementDate
  );

  if (!extracted.isPaymentProof) {
    reasons.push("납부 증빙으로 인식되지 않음 (송금/이체/거래내역 화면이 아님)");
  } else {
    ruleScore += 0.15;
  }

  if (extracted.amount == null) {
    reasons.push("금액을 읽을 수 없음");
  } else if (Number(extracted.amount) !== Number(criteria.participationFee)) {
    reasons.push(
      `금액 불일치 (기대: ${criteria.participationFee}, 추출: ${extracted.amount})`
    );
  } else {
    ruleScore += 0.35;
  }

  const recipientName =
    extracted.accountHolderName ?? extracted.counterpartyName ?? null;

  if (!maskedNameMatches(criteria.accountHolderName, recipientName)) {
    reasons.push(
      `받는 사람 이름 불일치 (기대: ${criteria.accountHolderName}, 추출: ${recipientName ?? "없음"})`
    );
  } else {
    ruleScore += 0.35;
  }

  if (!normalizedDate) {
    reasons.push("송금 날짜를 읽을 수 없음");
  } else if (!isDateOnOrAfter(normalizedDate, criteria.announcementDate)) {
    reasons.push(
      `송금일이 공시일(${criteria.announcementDate}) 이전임 (추출: ${normalizedDate})`
    );
  } else if (isDateInFuture(normalizedDate)) {
    reasons.push(`송금일이 미래 날짜임 (추출: ${normalizedDate})`);
  } else {
    ruleScore += 0.15;
  }

  if (extracted.senderName) {
    if (maskedNameMatches(payment.name, extracted.senderName)) {
      ruleScore += 0.1;
      notes.push("보낸 사람 이름 일치");
    } else {
      notes.push(
        `보낸 사람 이름 참고: 신청자 ${payment.name}, 추출 ${extracted.senderName}`
      );
    }
  }

  const confidence = Number(aiConfidence) || 0;
  const combinedConfidence = confidence * 0.35 + ruleScore * 0.65;
  const canAutoApprove =
    reasons.length === 0 &&
    combinedConfidence >= 0.8 &&
    confidence >= 0.7;

  return {
    status: canAutoApprove ? "auto_approved" : "suspicious",
    reasons,
    notes,
    normalizedDate,
    ruleScore,
    combinedConfidence,
    canAutoApprove,
  };
};
