import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

/**
 * 표준 Postgres 드라이버(postgres-js) — Neon, Supabase, RDS 등 어떤 Postgres든 DATABASE_URL만 바꾸면 동작.
 * prepare: false — Supabase의 Transaction Pooler(pgbouncer)는 prepared statement를 지원하지 않으므로
 * 어떤 제공자를 쓰든 안전하도록 비활성화.
 */
export function getDb() {
  if (!_db) {
    const client = postgres(process.env.DATABASE_URL!, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}
