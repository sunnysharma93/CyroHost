"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthDivider, PasswordField, TextField } from "@/components/auth/AuthFields";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { authFetch, readError, type AuthUser } from "@/lib/auth-api";

export function RegisterForm() {
  const router = useRouter();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const acceptedTerms = data.get("acceptedTerms") === "on";
    const next: Record<string, string> = {};
    if (fullName.length < 2) next.fullName = "Enter your full name.";
    if (!email.includes("@")) next.email = "Enter a valid email address.";
    if (password.length < 12) next.password = "Use at least 12 characters.";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (!acceptedTerms) next.acceptedTerms = "Accept the Terms and Privacy Policy to create an account.";
    setFields(next);
    if (Object.keys(next).length) {
      setFormError("Check the highlighted fields.");
      return;
    }
    setFormError("");
    setPending(true);
    try {
      const response = await authFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, confirmPassword, acceptedTerms }),
      });
      const body = await readError(response);
      if (!response.ok) {
        const nextFields = { ...(body.fields ?? {}) };
        if (body.error === "email_taken") nextFields.email = body.message ?? "An account with this email already exists.";
        setFields(nextFields);
        setFormError(body.message ?? "The account was not created.");
        return;
      }
      setUser(body as AuthUser);
      router.replace("/dashboard");
    } catch {
      setFormError("The account service is not reachable. Start the CyroHost auth API and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="text-[2rem] leading-tight font-light tracking-tight text-[#17151c]">Create your account</h1>
      <p className="mt-2 text-sm leading-6 text-[#5e5968]">Start building with CyroHost cloud infrastructure.</p>
      <p className="mt-1 text-xs leading-5 text-[#7a7486]">The password is stored only as a hash. Creating an account does not place an order.</p>
      {user ? (
        <p className="mt-6 text-sm leading-6 text-[#17151c]" role="status">
          Account created for {user.email}.{" "}
          <Link href="/" className="font-medium text-[#5c3d9e]">
            Continue to the site
          </Link>
          .
        </p>
      ) : (
        <>
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-3" aria-busy={pending}>
            <TextField label="Full name" name="fullName" autoComplete="name" error={fields.fullName} variant="split" />
            <TextField label="Email address" name="email" type="email" autoComplete="email" error={fields.email} variant="split" />
            <PasswordField label="Password" name="password" autoComplete="new-password" error={fields.password} strength variant="split" />
            <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" error={fields.confirmPassword} variant="split" />
            <div>
              <label className="flex min-h-11 items-start gap-2 pt-1 text-sm leading-6 text-[#1c1a22]">
                <input name="acceptedTerms" type="checkbox" className="mt-1 size-4 accent-[#5c3d9e]" />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-[#5c3d9e]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-[#5c3d9e]">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {fields.acceptedTerms ? <p className="mt-1 text-xs text-[#9b1c1c]">{fields.acceptedTerms}</p> : null}
            </div>
            {formError ? (
              <p className="text-sm text-[#9b1c1c]" role="alert">
                {formError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[#5c3d9e] px-4 text-sm font-medium text-white transition-colors hover:bg-[#4c3184] disabled:opacity-60"
            >
              {pending ? (
                <>
                  <span className="size-4 motion-safe:animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div className="my-5">
            <AuthDivider label="OR SIGN UP WITH" />
          </div>
          <SocialButtons mode="register" />
          <p className="mt-5 text-sm text-[#5e5968]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#5c3d9e] hover:text-[#3f2a72]">
              Login
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
