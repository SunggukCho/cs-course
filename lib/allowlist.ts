import { getDb } from "./db";
import { allowedUsers } from "./schema";

/**
 * 허용 규칙:
 *  - ALLOWED_EMAILS 환경변수(쉼표 구분) 또는 allowed_user 테이블 중 어느 한쪽에 있으면 허용
 *  - 두 목록이 모두 비어 있으면 전체 허용 (개인용 기본값)
 */
export async function isEmailAllowed(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const e = email.trim().toLowerCase();

  const envList = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (envList.includes(e)) return true;

  let dbList: string[] = [];
  try {
    const rows = await getDb().select({ email: allowedUsers.email }).from(allowedUsers);
    dbList = rows.map((r) => r.email.toLowerCase());
  } catch {
    // DB 조회 실패 시 env 목록만으로 판단
  }
  if (dbList.includes(e)) return true;

  return envList.length === 0 && dbList.length === 0;
}
