"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "./db";
import { progress } from "./schema";
import { TOTAL_DAYS } from "./curriculum";

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
