"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { links } from "@/config/site";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed z-30 flex flex-col-reverse items-end gap-3 right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))]">
      {showTop ? (
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center border border-line bg-panel text-ink shadow-lg"
          onClick={() => {
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
        >
          <ArrowUp aria-hidden="true" className="size-4" />
          <span className="sr-only">Back to top</span>
        </button>
      ) : null}
      <a
        href={links.whatsappChat}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex size-12 items-center justify-center bg-[#25D366] text-white shadow-lg motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
        aria-label="Chat with CyroHost on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 12 22a11 11 0 0 0 8.5-18.5zM12 20.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.4.2-.3a.5.5 0 0 0 0-.5c0-.1-.5-1.2-.7-1.6s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.5 4 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.1-.4-.2z"
          />
        </svg>
        <span className="pointer-events-none absolute right-14 hidden whitespace-nowrap border border-line bg-panel px-2 py-1 text-xs text-ink group-hover:block group-focus-visible:block">
          Chat with CyroHost
        </span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
