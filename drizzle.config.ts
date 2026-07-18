import { readFileSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit(CLI)은 .env.local을 자동 로드하지 않으므로 직접 읽어 process.env에 주입.
// 우선순위: 이미 설정된 실제 환경변수 > .env.local > .env
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      if (process.env[key] !== undefined) continue;
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch {
    // 파일 없으면 무시
  }
}

export default defineConfig({
  schema: "./lib/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});