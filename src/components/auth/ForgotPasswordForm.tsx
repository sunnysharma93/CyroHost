"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { TextField } from "@/components/auth/AuthFields";
import { authFetch, readError } from "@/lib/auth-api";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const response = await authFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const body = await readError(response);
      if (!response.ok) {
        setError(body.message ?? "The request could not be sent.");
        return;
      }
      setMessage(body.message ?? "If an account exists for that email, reset instructions will be sent.");
      setDevToken(body.devResetToken ?? "");
    } catch {
      setError("The account service is not reachable. Start the CyroHost auth API and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md border border-line bg-panel p-6 sm:p-8">
      <h1 className="display text-4xl">Reset your password</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        If an account exists, reset instructions are sent only when email is configured on the server.
      </p>
      {message ? (
        <div className="mt-6 space-y-3 text-sm leading-6" role="status">
          <p>{message}</p>
          {devToken ? (
            <p className="border border-line bg-raised p-3 text-muted">
              Development only: email is not configured, so the reset token was returned by the local API.{" "}
              <Link href={`/reset-password?token=${encodeURIComponent(devToken)}`} className="text-cyan">
                Continue
              </Link>
              .
            </p>
          ) : null}
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4" aria-busy={pending}>
          <TextField label="Email" name="email" type="email" autoComplete="email" error={error} />
          <button type="submit" disabled={pending} className="inline-flex min-h-11 w-full items-center justify-center bg-accent px-4 text-sm text-accent-ink disabled:opacity-60">
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-5 text-sm">
        <Link href="/login" className="text-cyan">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
