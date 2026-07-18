import { pgTable, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const progress = pgTable(
  "progress",
  {
    userId: text("user_id").notNull(), // Google sub
    day: integer("day").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })]
);

/** 로그인 허용 이메일 화이트리스트. 비어 있으면(그리고 ALLOWED_EMAILS도 없으면) 전체 허용 */
export const allowedUsers = pgTable("allowed_user", {
  email: text("email").primaryKey(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});
