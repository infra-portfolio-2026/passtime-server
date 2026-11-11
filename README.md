# PASSTIME Server

행사 입장권 발급과 참가비 납부 내역 확인을 처리하는 백엔드 서버입니다.

## 주요 내용

- 인증, 티켓·NFC 입장, 납부·환불, 소속·권한, FCM 알림 API
- 이체 캡처에서 AI가 값만 추출하고 서버 규칙이 승인을 판정하는 납부 검토 흐름
- Docker Compose(MongoDB), PM2 자동 재시작, GitHub Webhook 자동 배포로 운영

## 기술

Node.js · Express · MongoDB · JWT · Firebase FCM · Gemini API · Docker

`.env`와 Firebase 서비스 계정 키는 포함하지 않았습니다.


> 블라인드 채용 제출용 사본입니다. 이름·기관명·비밀값은 치환하거나 제외했고, 커밋 기록은 새로 만들었습니다. 치환된 식별자 때문에 그대로 빌드되지 않을 수 있습니다.
