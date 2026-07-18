"use client";

import Script from "next/script";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

/** GIS One Tap 프롬프트. 로그인 화면에서만 렌더 */
export default function OneTap() {
  const clientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
  if (!clientId) return null;

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        window.google?.accounts.id.initialize({
          client_id: clientId,
          use_fedcm_for_prompt: true,
          callback: async ({ credential }) => {
            await signIn("google-one-tap", { credential, redirectTo: "/" });
          },
        });
        window.google?.accounts.id.prompt();
      }}
    />
  );
}
