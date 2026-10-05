"use client";

import { useEffect, useState } from "react";
import { apiBase, providerStatus } from "@/lib/auth-api";

const providers = [
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
  { id: "facebook", label: "Facebook" },
] as const;

export function SocialButtons({ mode }: { mode: "login" | "register" }) {
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancel = false;
    providerStatus()
      .then((status) => {
        if (!cancel) setReady(status);
      })
      .catch(() => {
        if (!cancel) setReady({});
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="space-y-2.5">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="flex h-11 w-full items-center justify-center gap-3 border border-[#e4e0ea] bg-white px-4 text-sm font-medium text-[#1c1a22] transition-colors hover:border-[#5c3d9e]"
          onClick={() => {
            if (!ready[provider.id]) {
              setNotice(`${provider.label} login setup is pending. Add the provider credentials on the auth server before this button can be used.`);
              return;
            }
            window.location.assign(`${apiBase}/api/auth/oauth/${provider.id}/start`);
          }}
        >
          <ProviderMark id={provider.id} />
          {mode === "login" ? `Continue with ${provider.label}` : `Sign up with ${provider.label}`}
        </button>
      ))}
      {notice ? (
        <p className="text-sm leading-6 text-[#5e5968]" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

function ProviderMark({ id }: { id: "google" | "facebook" | "apple" }) {
  if (id === "google") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7C21.6 18.7 23 15.8 23 12.3z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1 7.9-2.8l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.2-6.9-5.1H1.3v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.1 14.4A7.2 7.2 0 0 1 4.7 12c0-.8.1-1.6.4-2.4V6.5H1.3A12 12 0 0 0 0 12c0 1.9.5 3.8 1.3 5.5l3.8-3.1z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0A12 12 0 0 0 1.3 6.5l3.8 3.1C6.1 7 8.8 4.8 12 4.8z" />
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path fill="#1877F2" d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8v2.2h3.3l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="currentColor" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.3c.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.9zM14.7 5.8c.6-.8 1.1-1.9.9-3-1 .1-2.1.6-2.8 1.4-.6.7-1.2 1.8-.9 2.9 1.1.1 2.1-.5 2.8-1.3z" />
    </svg>
  );
}
