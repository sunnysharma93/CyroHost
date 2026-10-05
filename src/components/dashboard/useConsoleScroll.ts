"use client";

import { useEffect } from "react";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useConsoleScroll(pathname: string) {
  useEffect(() => {
    document.getElementById("dash-scroll")?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const scroller = () => document.getElementById("dash-scroll");

    function onKey(event: KeyboardEvent) {
      const node = scroller();
      if (!node) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.target instanceof Node && node.contains(event.target)) return;
      const page = Math.max(120, node.clientHeight * 0.9);
      if (event.key === "PageDown") node.scrollBy({ top: page });
      else if (event.key === "PageUp") node.scrollBy({ top: -page });
      else if (event.key === "Home") node.scrollTo({ top: 0 });
      else if (event.key === "End") node.scrollTo({ top: node.scrollHeight });
      else if (event.key === " " && !(event.target instanceof HTMLElement && (event.target.tagName === "BUTTON" || event.target.tagName === "A"))) {
        node.scrollBy({ top: page });
      } else return;
      event.preventDefault();
    }

    function onWheel(event: WheelEvent) {
      const node = scroller();
      if (!node || event.ctrlKey) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (node.contains(target)) return;
      if (target instanceof Element && target.closest(".dash-sidebar, [role='dialog']")) return;
      node.scrollBy({ top: event.deltaY, left: 0 });
      event.preventDefault();
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);
}
