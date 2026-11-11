// 한글 마지막 글자의 받침(종성) 유무를 판단해 알맞은 조사를 붙여줍니다.

const NUMBER_BATCHIM = {
  "0": true, // 영
  "1": true, // 일
  "2": false, // 이
  "3": true, // 삼
  "4": false, // 사
  "5": false, // 오
  "6": true, // 육
  "7": true, // 칠
  "8": true, // 팔
  "9": false, // 구
};

export const hasBatchim = (word) => {
  if (!word) return false;

  const lastChar = String(word).trim().slice(-1);
  if (!lastChar) return false;

  const code = lastChar.charCodeAt(0);

  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 !== 0;
  }

  if (lastChar >= "0" && lastChar <= "9") {
    return NUMBER_BATCHIM[lastChar];
  }

  return false;
};

export const appendJosa = (word, withBatchim, withoutBatchim) =>
  `${word ?? ""}${hasBatchim(word) ? withBatchim : withoutBatchim}`;

export const josaIGa = (word) => appendJosa(word, "이", "가");
export const josaEulReul = (word) => appendJosa(word, "을", "를");
export const josaEunNeun = (word) => appendJosa(word, "은", "는");
export const josaWaGwa = (word) => appendJosa(word, "과", "와");
