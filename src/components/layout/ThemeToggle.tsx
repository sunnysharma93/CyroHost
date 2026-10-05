"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Preference = "light" | "dark" | "system";

function resolve(preference: Preference) {
  if (preference === "light" || preference === "dark") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(preference: Preference) {
  const theme = resolve(preference);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<Preference>("light");

  useEffect(() => {
    const stored = localStorage.getItem("cyro-theme");
    const next: Preference = stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
    setPreference(next);
    apply(next);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = localStorage.getItem("cyro-theme");
      if (current !== "light" && current !== "dark") apply("system");
    };
    media.addEventListener("change", onChange);
    const onTheme = (event: Event) => {
      const detail = (event as CustomEvent<Preference>).detail;
      if (detail === "light" || detail === "dark" || detail === "system") setPreference(detail);
    };
    window.addEventListener("cyro-theme-change", onTheme);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("cyro-theme-change", onTheme);
    };
  }, []);

  function cycle() {
    const order: Preference[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(preference) + 1) % order.length];
    localStorage.setItem("cyro-theme", next);
    setPreference(next);
    apply(next);
    window.dispatchEvent(new CustomEvent("cyro-theme-change", { detail: next }));
  }

  const Icon = preference === "dark" ? Moon : preference === "light" ? Sun : Monitor;
  const label =
    preference === "light"
      ? "Light theme. Switch to dark."
      : preference === "dark"
        ? "Dark theme. Switch to match the system."
        : "System theme. Switch to light.";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="inline-flex size-11 items-center justify-center border border-line text-ink"
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}
