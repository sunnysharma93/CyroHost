"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { passwordStrength } from "@/lib/auth-api";

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-[#e4e0ea]" />
      <span className="text-[10px] font-medium tracking-[0.16em] text-[#7a7486]">{label}</span>
      <span className="h-px flex-1 bg-[#e4e0ea]" />
    </div>
  );
}

const themeInput = "min-h-11 w-full border border-line bg-panel px-3 text-sm text-ink";
const splitInput =
  "h-11 w-full min-w-0 border border-[#e4e0ea] bg-white px-3 text-sm text-[#17151c] transition-colors focus:border-[#5c3d9e]";

export function TextField({
  label,
  name,
  type = "text",
  autoComplete,
  error,
  variant = "theme",
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  variant?: "theme" | "split";
}) {
  const errorId = `${name}-error`;
  const split = variant === "split";
  return (
    <div>
      <label htmlFor={name} className={split ? "mb-1.5 block text-[13px] font-medium text-[#1c1a22]" : "block text-sm text-ink"}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        autoCapitalize={type === "email" ? "none" : undefined}
        spellCheck={type === "email" ? false : undefined}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={split ? splitInput : `mt-2 ${themeInput}`}
      />
      {error ? (
        <p id={errorId} className={split ? "mt-1 text-xs text-[#9b1c1c]" : "mt-2 text-sm text-danger"}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField({
  label,
  name,
  autoComplete,
  error,
  strength = false,
  variant = "theme",
}: {
  label: string;
  name: string;
  autoComplete: string;
  error?: string;
  strength?: boolean;
  variant?: "theme" | "split";
}) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const errorId = `${name}-error`;
  const strengthId = `${name}-strength`;
  const meter = passwordStrength(value);
  const split = variant === "split";
  const describedBy = [strength && value ? strengthId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className={split ? "mb-1.5 block text-[13px] font-medium text-[#1c1a22]" : "block text-sm text-ink"}>
        {label}
      </label>
      <div className={split ? "relative" : "relative mt-2"}>
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${split ? splitInput : themeInput} pr-12`}
        />
        <button
          type="button"
          className={`absolute inset-y-0 right-0 grid w-11 place-items-center ${split ? "text-[#5e5968]" : "text-muted"}`}
          aria-pressed={visible}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {strength && value ? (
        <p id={strengthId} className={split ? "mt-1.5 text-xs text-[#5e5968]" : "mt-2 text-xs tracking-[0.12em] text-muted uppercase"}>
          Password strength: {meter.label}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={split ? "mt-1 text-xs text-[#9b1c1c]" : "mt-2 text-sm text-danger"}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
