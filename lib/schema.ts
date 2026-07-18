import { pgTable, text, integer, serial, timestamp, primaryKey, index } from "drizzle-orm/pg-core";

export const progress = pgTable(
  "progress",
  {
    userId: text("user_id").notNull(), // Google sub
    day: integer("day").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })]
);

/** 형광펜 하이라이트. 텍스트 인용 앵커(exact/prefix/suffix)로 저장해 콘텐츠 수정에도 재탐색 가능 */
export const highlight = pgTable(
  "highlight",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Google sub
    day: integer("day").notNull(),
    exact: text("exact").notNull(),
    prefix: text("prefix").notNull().default(""),
    suffix: text("suffix").notNull().default(""),
    color: text("color").notNull().default("y"), // y | g | p
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("highlight_user_day_idx").on(t.userId, t.day)]
);

/** 로그인 허용 이메일 화이트리스트. 비어 있으면(그리고 ALLOWED_EMAILS도 없으면) 전체 허용 */
export const allowedUsers = pgTable("allowed_user", {
  email: text("email").primaryKey(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});
