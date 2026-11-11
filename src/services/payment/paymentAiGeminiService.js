import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../../uploads/paymentPictures");

const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
};

export const readPaymentImage = async (paymentPictureUrl) => {
  if (!paymentPictureUrl) return null;

  const marker = "/paymentPictures/";
  const markerIndex = paymentPictureUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  const filename = decodeURIComponent(
    paymentPictureUrl.slice(markerIndex + marker.length).split("?")[0]
  );
  const filePath = path.join(UPLOAD_DIR, filename);

  const buffer = await fs.readFile(filePath);
  return {
    base64: buffer.toString("base64"),
    mimeType: getMimeType(filename),
  };
};

const buildPrompt = ({ paymentName, criteria }) => `
이 이미지는 대학 행사 참가비 납부 증빙입니다.
이체 완료 화면, 송금 완료 화면, 은행/토스/카카오 **통장 거래내역** 화면 모두 가능합니다.

아래 기준과 **가장 잘 맞는 거래 1건**만 골라 정보를 추출하세요.

[기준 정보]
- 행사 공시일: ${criteria.announcementDate}
- 참가비: ${criteria.participationFee}원
- 계좌 받는 사람(받는 분): ${criteria.accountHolderName}
- 납부 신청자: ${paymentName} (보낸 사람, 화면에 없으면 null)

[거래내역 화면일 때]
- 출금/이체/송금 항목 중 금액이 ${criteria.participationFee}원이고
- 상대방·받는 사람·입금계좌 예금주가 "${criteria.accountHolderName}"와 맞는 줄을 찾으세요.
- 그 줄의 날짜·금액·받는 사람 이름을 사용하세요.
- 통장 거래내역도 납부 증빙이면 isPaymentProof: true

반드시 아래 JSON 형식만 반환하세요.
{
  "amount": number | null,
  "date": "YYYY-MM-DD" | null,
  "senderName": string | null,
  "accountHolderName": string | null,
  "counterpartyName": string | null,
  "isPaymentProof": boolean,
  "confidence": number
}

규칙:
- amount: 원 단위 숫자 (쉼표 제외)
- date: 연도 없으면 공시일(${criteria.announcementDate})과 같은 해로 추정
- senderName: 보낸 사람/송금인 (화면에 없으면 null, 필수 아님)
- accountHolderName: 받는 사람/예금주 (마스킹 포함)
- counterpartyName: 거래내역의 상대방 이름 (출금 시 받는 사람)
- isPaymentProof: 송금·이체·거래내역 등 납부 증빙이면 true
- confidence: 0~1
`.trim();

export const analyzePaymentImage = async ({ image, paymentName, criteria }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildPrompt({ paymentName, criteria }) },
            {
              inline_data: {
                mime_type: image.mimeType,
                data: image.base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API 오류: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini API 응답이 비어 있습니다.");
  }

  const parsed = JSON.parse(text);
  return {
    amount: parsed.amount != null ? Number(parsed.amount) : null,
    date: parsed.date ?? null,
    senderName: parsed.senderName ?? null,
    accountHolderName: parsed.accountHolderName ?? null,
    counterpartyName: parsed.counterpartyName ?? null,
    isPaymentProof: Boolean(
      parsed.isPaymentProof ?? parsed.isTransferScreenshot
    ),
    confidence: Number(parsed.confidence) || 0,
    model,
  };
};
