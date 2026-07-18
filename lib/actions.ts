"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "./db";
import { progress, highlight } from "./schema";
import { TOTAL_DAYS } from "./curriculum";

const COLORS = new Set(["y", "g", "p"]);

export type CreateHighlightInput = {
  day: number;
  exact: string;
  prefix?: string;
  suffix?: string;
  color: string;
};

export async function createHighlight(input: CreateHighlightInput): Promise<{ id: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const { day, exact, color } = input;
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) throw new Error("INVALID_DAY");
  if (typeof exact !== "string" || exact.length < 2 || exact.length > 2000) throw new Error("INVALID_EXACT");
  if (!COLORS.has(color)) throw new Error("INVALID_COLOR");

  const db = getDb();
  const [row] = await db
    .insert(highlight)
    .values({
      userId: session.user.id,
      day,
      exact,
      prefix: (input.prefix ?? "").slice(0, 40),
      suffix: (input.suffix ?? "").slice(0, 40),
      color,
    })
    .returning({ id: highlight.id });
  return { id: row.id };
}

export async function deleteHighlight(id: number): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  if (!Number.isInteger(id)) throw new Error("INVALID_ID");

  const db = getDb();
  // 삭제는 본인 것만
  await db.delete(highlight).where(and(eq(highlight.id, id), eq(highlight.userId, session.user.id)));
}

export async function toggleDay(day: number, done: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) throw new Error("INVALID_DAY");

  const db = getDb();
  if (done) {
    await db.insert(progress).values({ userId: session.user.id, day }).onConflictDoNothing();
  } else {
    await db.delete(progress).where(and(eq(progress.userId, session.user.id), eq(progress.day, day)));
  }
}
