import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS 기본기 65일 — 아침 8시 커리큘럼",
  description: "5년차 개발자를 위한 컴퓨터 사이언스 기본기 데일리 코스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
