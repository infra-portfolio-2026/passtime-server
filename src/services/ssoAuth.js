import fetch from "node-fetch";
import * as cheerio from "cheerio";

class VerifySSOService {
  constructor() {
    this.finalUrl = "https://classic.univ.ac.kr/classic/reading/status.do";
  }

  async verifySSOToken(ssotoken) {
    try {
      if (!ssotoken) {
        throw new Error("❌ SSO 토큰이 제공되지 않음");
      }

      const finalResponse = await fetch(this.finalUrl, {
        method: "GET",
        headers: {
          Cookie: `ssotoken=${ssotoken};`,
          "User-Agent": "Mozilla/5.0",
        },
        credentials: "include",
      });

      const html = await finalResponse.text();

      if (html.includes("로그인") || html.includes("OO대학교 포털")) {
        throw new Error("❌ SSO 인증 실패: 로그인 페이지가 반환됨");
      }

      const profileData = this.extractProfileData(html);

      return profileData;
    } catch (error) {
      console.error("❌ SSO 토큰 검증 및 프로필 조회 실패:", error);
      throw new Error("Failed: Authentication process failed");
    }
  }

  extractProfileData(html) {
    const $ = cheerio.load(html);

    const major = $("th:contains('학과명')").next().text().trim();
    const studentId = $("th:contains('학번')").next().text().trim();
    const name = $("th:contains('이름')").next().text().trim();
    const gradeLevel = $("th:contains('학년')").next().text().trim();

    if (!major || !studentId || !name || !gradeLevel) {
      throw new Error("❌ 필수 데이터가 누락되었습니다");
    }

    return { major, studentId, name, gradeLevel };
  }
}

const verifySSOService = new VerifySSOService();
export default verifySSOService;
