"use client";

import { useState, type FormEvent } from "react";
import { contactSchema, interests } from "@/lib/contact";
import { site, links } from "@/config/site";

type Status = "idle" | "submitting" | "delivered" | "not_configured" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      setStatus("idle");
      setFormError("Check the highlighted fields.");
      return;
    }

    if (parsed.data.companyWebsite) {
      setStatus("error");
      setFormError("The form could not be submitted.");
      return;
    }

    setFieldErrors({});
    setFormError("");
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await response.json()) as { delivered?: boolean; error?: string; message?: string };
      if (body.delivered) {
        setStatus("delivered");
        form.reset();
        return;
      }
      if (body.error === "not_configured" || response.status === 503) {
        setStatus("not_configured");
        return;
      }
      setStatus("error");
      setFormError(body.message ?? "The enquiry was not delivered. Use email or WhatsApp instead.");
    } catch {
      setStatus("error");
      setFormError("The enquiry was not delivered. Use email or WhatsApp instead.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Name" name="name" error={fieldErrors.name} autoComplete="name" />
      <Field label="Email" name="email" type="email" error={fieldErrors.email} autoComplete="email" />
      <Field label="Organisation" name="organisation" error={fieldErrors.organisation} autoComplete="organization" optional />

      <div>
        <label htmlFor="interest" className="block text-sm text-ink">
          Service
        </label>
        <select
          id="interest"
          name="interest"
          defaultValue="VPS"
          aria-invalid={Boolean(fieldErrors.interest)}
          className="mt-2 min-h-11 w-full border border-line bg-panel px-3 text-sm text-ink"
        >
          {interests.map((interest) => (
            <option key={interest} value={interest}>
              {interest}
            </option>
          ))}
        </select>
        {fieldErrors.interest ? <p className="mt-2 text-sm text-danger">{fieldErrors.interest}</p> : null}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-ink">
          Workload
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className="mt-2 w-full border border-line bg-panel px-3 py-3 text-sm leading-6 text-ink"
          placeholder="Region, size, operating system, bandwidth, or the site you want to host."
        />
        {fieldErrors.message ? (
          <p id="message-error" className="mt-2 text-sm text-danger">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 items-center bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-60"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>

      <div aria-live="polite" className="text-sm leading-6">
        {status === "delivered" ? (
          <p className="text-cyan">The enquiry was accepted by the configured delivery endpoint.</p>
        ) : null}
        {status === "not_configured" ? (
          <p className="text-warn">
            This form is not connected to a delivery service, so the message was not sent. Email{" "}
            <a className="underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>{" "}
            or use{" "}
            <a className="underline" href={links.whatsappChat} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            .
          </p>
        ) : null}
        {formError ? <p className="text-danger">{formError}</p> : null}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  type = "text",
  autoComplete,
  optional = false,
}: {
  label: string;
  name: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  optional?: boolean;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-ink">
        {label}
        {optional ? <span className="text-muted"> (optional)</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={!optional}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 min-h-11 w-full border border-line bg-panel px-3 text-sm text-ink"
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
