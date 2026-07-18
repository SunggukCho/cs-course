import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyGoogleIdToken } from "@/lib/google-id-token";
import { isEmailAllowed } from "@/lib/allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // 표준 OAuth/OIDC 리디렉션 플로우 (One Tap이 안 뜨는 환경의 폴백)
    Google,
    // GIS(Google Identity Services) One Tap — 클라이언트가 받은 ID 토큰을 서버에서 검증
    Credentials({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: { credential: { type: "text" } },
      async authorize(credentials) {
        const credential = credentials?.credential;
        if (typeof credential !== "string") return null;
        try {
          const p = await verifyGoogleIdToken(credential);
          if (!p.email_verified) return null;
          return { id: p.sub, name: p.name, email: p.email, image: p.picture };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // 두 로그인 경로 모두 여기서 화이트리스트 검사
    async signIn({ user }) {
      return isEmailAllowed(user.email);
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
