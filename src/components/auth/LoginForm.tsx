"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthDivider, PasswordField, TextField } from "@/components/auth/AuthFields";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { authFetch, consolePath, currentUser, readError, type AuthUser } from "@/lib/auth-api";

const oauthReasons: Record<string, string> = {
  oauth_not_configured: "Social login setup is pending.",
  email_exists: "An account with this email already exists. Sign in with email. Social accounts are not linked automatically.",
  oauth_state: "The social sign-in attempt expired. Try again.",
  provider: "The social provider did not complete sign-in.",
};

function SubmitButton({ pending, label, busy }: { pending: boolean; label: string; busy: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[#5c3d9e] px-4 text-sm font-medium text-white transition-colors hover:bg-[#4c3184] disabled:opacity-60"
    >
      {pending ? (
        <>
          <span className="size-4 motion-safe:animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          {busy}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (params.get("reason") === "session") {
      setFormError("Your session ended. Sign in again to continue.");
    }
    const oauth = params.get("oauth");
    if (oauth === "error") {
      setFormError(oauthReasons[params.get("reason") ?? ""] ?? "Social sign-in did not complete.");
      return;
    }
    if (oauth !== "complete") return;
    let cancel = false;
    currentUser().then((next) => {
      if (cancel) return;
      if (next) router.replace(consolePath(next));
      else setFormError("Social sign-in did not create a session.");
    });
    return () => {
      cancel = true;
    };
  }, [params, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const next: Record<string, string> = {};
    if (!email.includes("@")) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setFields(next);
    if (Object.keys(next).length) {
      setFormError("Check the highlighted fields.");
      return;
    }
    setFormError("");
    setPending(true);
    try {
      const response = await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          rememberMe: data.get("rememberMe") === "on",
        }),
      });
      const body = await readError(response);
      if (!response.ok) {
        setFields(body.fields ?? {});
        setFormError(body.message ?? "Email or password is incorrect.");
        return;
      }
      const signedIn = body as AuthUser;
      setUser(signedIn);
      router.replace(consolePath(signedIn));
    } catch {
      setFormError("The sign-in service is not reachable. Start the CyroHost auth API and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="text-[2rem] leading-tight font-light tracking-tight text-[#17151c]">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-[#5e5968]">Sign in to your CyroHost account.</p>
      <p className="mt-1 text-xs leading-5 text-[#7a7486]">This checks the account API and does not place an order.</p>
      {user ? (
        <p className="mt-6 text-sm leading-6 text-[#17151c]" role="status">
          Signed in as {user.fullName}.{" "}
          <Link href="/" className="font-medium text-[#5c3d9e]">
            Continue to the site
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="mt-6">
            <SocialButtons mode="login" />
          </div>
          <div className="my-5">
            <AuthDivider label="OR CONTINUE WITH EMAIL" />
          </div>
          <form onSubmit={onSubmit} noValidate className="space-y-3.5" aria-busy={pending}>
            <TextField label="Email address" name="email" type="email" autoComplete="email" error={fields.email} variant="split" />
            <PasswordField label="Password" name="password" autoComplete="current-password" error={fields.password} variant="split" />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
              <label className="inline-flex min-h-11 items-center gap-2 text-[#1c1a22]">
                <input name="rememberMe" type="checkbox" className="size-4 accent-[#5c3d9e]" />
                Remember me
              </label>
              <Link href="/forgot-password" className="inline-flex min-h-11 items-center text-[#5c3d9e] hover:text-[#3f2a72]">
                Forgot password
              </Link>
            </div>
            {formError ? (
              <p className="text-sm text-[#9b1c1c]" role="alert">
                {formError}
              </p>
            ) : null}
            <SubmitButton pending={pending} label="Login" busy="Signing in…" />
          </form>
          <p className="mt-5 text-sm text-[#5e5968]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#5c3d9e] hover:text-[#3f2a72]">
              Create account
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
