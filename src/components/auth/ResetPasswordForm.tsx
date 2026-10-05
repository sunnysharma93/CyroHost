"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordField } from "@/components/auth/AuthFields";
import { authFetch, readError } from "@/lib/auth-api";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState(token ? "" : "This reset link is invalid or has expired.");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const next: Record<string, string> = {};
    if (password.length < 12) next.password = "Use at least 12 characters.";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    setFields(next);
    if (!token) {
      setFormError("This reset link is invalid or has expired.");
      return;
    }
    if (Object.keys(next).length) {
      setFormError("Check the highlighted fields.");
      return;
    }
    setFormError("");
    setPending(true);
    try {
      const response = await authFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const body = await readError(response);
      if (!response.ok) {
        setFields(body.fields ?? {});
        setFormError(body.message ?? "This reset link is invalid or has expired.");
        return;
      }
      setMessage(body.message ?? "Password updated. Sign in with the new password.");
    } catch {
      setFormError("The account service is not reachable. Start the CyroHost auth API and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md border border-line bg-panel p-6 sm:p-8">
      <h1 className="display text-4xl">Choose a new password</h1>
      {message ? (
        <p className="mt-6 text-sm leading-6" role="status">
          {message}{" "}
          <Link href="/login" className="text-cyan">
            Login
          </Link>
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4" aria-busy={pending}>
          <PasswordField label="Password" name="password" autoComplete="new-password" error={fields.password} strength />
          <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" error={fields.confirmPassword} />
          {formError ? (
            <p className="text-sm text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="inline-flex min-h-11 w-full items-center justify-center bg-accent px-4 text-sm text-accent-ink disabled:opacity-60">
            {pending ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
