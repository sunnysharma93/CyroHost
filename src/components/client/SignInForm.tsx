"use client";

import { useState, type FormEvent } from "react";

export function SignInForm() {
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    if (!email.includes("@") || password.length < 8) {
      setMessage("Enter an email address and a password of at least 8 characters. Nothing was submitted.");
      return;
    }
    setMessage("Sign-in is not connected to an account system. No password was checked and no session was created.");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4 border border-line bg-panel p-5">
      <div>
        <label htmlFor="email" className="block text-sm text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="mt-2 w-full border border-line bg-navy px-3 py-3 text-sm text-ink" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="mt-2 w-full border border-line bg-navy px-3 py-3 text-sm text-ink"
        />
      </div>
      <button type="submit" className="inline-flex min-h-11 items-center bg-accent px-4 text-sm font-medium text-accent-ink">
        Sign in
      </button>
      <p aria-live="polite" className="text-sm leading-6 text-warn">
        {message}
      </p>
    </form>
  );
}
