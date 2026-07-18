import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { progress } from "./schema";

export async function getCompletedDays(userId: string): Promise<number[]> {
  const db = getDb();
  const rows = await db.select({ day: progress.day }).from(progress).where(eq(progress.userId, userId));
  return rows.map((r) => r.day);
}
