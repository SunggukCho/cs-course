# CS 기본기 65일 코스

5년차 개발자를 위한 CS 기본기 데일리 코스 웹앱.
Next.js 16 (App Router) · Auth.js v5 · GIS(One Tap) · Drizzle ORM · Postgres.

## 배포 순서

### 1. GitHub
```bash
git init && git add -A && git commit -m "init"
git remote add origin <새 repo URL>
git push -u origin main
```

### 2. Postgres — Neon 또는 Supabase 아무거나
드라이버가 표준 postgres-js라서 `DATABASE_URL`만 넣으면 어느 Postgres든 동작합니다.
- **Neon**: 프로젝트 생성 → Connection string 복사
- **Supabase**: 프로젝트 생성 → Connect → **Transaction Pooler** URI(포트 6543) 복사
  (Session/Direct 연결도 되지만 서버리스에선 pooler 권장. `prepare: false` 처리는 코드에 이미 되어 있음)

### 3. Google OAuth (GIS + OAuth 클라이언트)
GIS(One Tap)와 리디렉션 로그인 둘 다 **같은 OAuth 클라이언트 ID 하나**를 씁니다.
1. https://console.cloud.google.com → API 및 서비스 → OAuth 동의 화면 구성
2. 사용자 인증 정보 → OAuth 클라이언트 ID → **웹 애플리케이션**
3. **승인된 자바스크립트 원본**(GIS용): `http://localhost:3000`, `https://<배포도메인>`
4. **승인된 리디렉션 URI**(폴백 버튼용): `http://localhost:3000/api/auth/callback/google`, `https://<배포도메인>/api/auth/callback/google`
5. 클라이언트 ID → `AUTH_GOOGLE_ID` **및** `NEXT_PUBLIC_AUTH_GOOGLE_ID`(같은 값), 보안 비밀 → `AUTH_GOOGLE_SECRET`

### 4. Vercel
저장소 import → Environment Variables에 `.env.example`의 값 등록 → Deploy.
`AUTH_SECRET`은 `openssl rand -base64 32`로 생성.

> 보안 비밀은 Vercel 환경변수와 로컬 `.env.local`에만. 채팅·저장소에 붙여넣지 않기.

### 5. 테이블 생성 (1회)
```bash
npm install
npm run db:push   # progress, allowed_user 테이블 생성
```

## 로그인 방식: GIS One Tap + 폴백
- 페이지에 접속하면 GIS **One Tap** 프롬프트가 뜨고, 선택 즉시 로그인됩니다.
  (받은 ID 토큰은 서버에서 Google 공개키로 서명·발급자·대상을 전부 검증)
- One Tap은 사용자가 닫으면 일정 시간 다시 안 뜨는 쿨다운이 있어, 그런 경우를 위해
  "Google로 시작하기" 버튼(표준 OAuth 리디렉션)이 폴백으로 함께 있습니다.

## 사용자 화이트리스트
허용 규칙: **ALLOWED_EMAILS 환경변수 ∪ allowed_user 테이블**. 두 목록이 모두 비어 있으면 누구나 로그인 가능(개인용 기본값).

**방법 A — 환경변수** (변경 시 재배포 필요):
```
ALLOWED_EMAILS=me@gmail.com,friend@gmail.com
```

**방법 B — DB 테이블** (재배포 없이 즉시 반영, 권장):
Neon/Supabase SQL 콘솔에서
```sql
INSERT INTO allowed_user (email) VALUES ('friend@gmail.com');
DELETE FROM allowed_user WHERE email = 'friend@gmail.com';  -- 제거
```

**방법 C — 코드 밖에서**: OAuth 동의 화면을 '테스트' 상태로 두면 Google 쪽 '테스트 사용자' 목록에 있는 계정만 로그인 가능. 다만 앱 로직과 무관한 Google 콘솔 설정이라, 운영은 A/B를 권장.

## 구조
- `lib/curriculum.ts` — 65일 커리큘럼
- `lib/lessons/phaseN.ts` — 페이즈별 수업(설명·SVG·퀴즈), `lib/lessons/index.ts`에서 병합
- `lib/allowlist.ts` — 화이트리스트 판정
- `lib/google-id-token.ts` — GIS ID 토큰 검증
- `lib/actions.ts` — 완료 토글 서버 액션
- `components/Course.tsx` — 로드맵 + 수업 모달 UI
# cs-course
