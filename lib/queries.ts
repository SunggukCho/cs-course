import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { progress, highlight } from "./schema";

export async function getCompletedDays(userId: string): Promise<number[]> {
  const db = getDb();
  const rows = await db.select({ day: progress.day }).from(progress).where(eq(progress.userId, userId));
  return rows.map((r) => r.day);
}

export type HighlightRow = {
  id: number;
  day: number;
  exact: string;
  prefix: string;
  suffix: string;
  color: string;
};

/** 페이지 진입 시 1회 — 사용자의 전체 하이라이트 로드 */
export async function getHighlights(userId: string): Promise<HighlightRow[]> {
  const db = getDb();
  return db
    .select({
      id: highlight.id,
      day: highlight.day,
      exact: highlight.exact,
      prefix: highlight.prefix,
      suffix: highlight.suffix,
      color: highlight.color,
    })
    .from(highlight)
    .where(eq(highlight.userId, userId));
}
