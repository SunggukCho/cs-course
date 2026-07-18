import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type GoogleIdTokenPayload = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

/** GIS(One Tap)가 발급한 ID 토큰을 서명·발급자·대상까지 검증 */
export async function verifyGoogleIdToken(credential: string): Promise<GoogleIdTokenPayload> {
  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: process.env.AUTH_GOOGLE_ID,
  });
  return payload as GoogleIdTokenPayload;
}
