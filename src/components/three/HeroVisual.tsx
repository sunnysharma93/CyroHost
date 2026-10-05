"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { RackFallback } from "@/components/graphics/RackFallback";

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

const InfrastructureScene = dynamic(() => import("@/components/three/InfrastructureScene"), {
  ssr: false,
});

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroVisual() {
  const frame = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setWebgl(canUseWebGL() && !reduce);

    const node = frame.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      className="frame frame-ticks dot-grid relative h-[300px] overflow-hidden sm:h-[380px] lg:h-[520px]"
      role="img"
      aria-label="Stylized infrastructure core linking compute, network, storage, and edge"
    >
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
        aria-hidden={ready}
      >
        <RackFallback />
      </div>
      {webgl ? (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <SceneBoundary
            onError={() => {
              setReady(false);
              setWebgl(false);
            }}
          >
            <InfrastructureScene active={visible} onReady={() => setReady(true)} />
          </SceneBoundary>
        </div>
      ) : null}
    </div>
  );
}
