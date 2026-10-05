"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { globeSites, type GlobeSite } from "@/content/globe";

function latLon(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function graticule(color: string) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.38 });
  const add = (points: THREE.Vector3[]) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    group.add(new THREE.Line(geometry, material));
  };
  for (let lon = -150; lon <= 180; lon += 30) {
    const points: THREE.Vector3[] = [];
    for (let lat = -78; lat <= 78; lat += 3) points.push(latLon(lat, lon, 1.006));
    add(points);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const points: THREE.Vector3[] = [];
    for (let lon = -180; lon <= 180; lon += 3) points.push(latLon(lat, lon, 1.006));
    add(points);
  }
  return group;
}

function Marker({
  site,
  selected,
  onSelect,
  moved,
}: {
  site: GlobeSite;
  selected: boolean;
  onSelect: (id: string) => void;
  moved: MutableRefObject<boolean>;
}) {
  const position = useMemo(() => latLon(site.lat, site.lon, 1.045), [site.lat, site.lon]);
  const color = site.markerColor;

  return (
    <group position={position}>
      <mesh
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (moved.current) return;
          onSelect(site.id);
        }}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[selected ? 0.055 : 0.034, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {selected ? (
        <mesh>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} />
        </mesh>
      ) : null}
    </group>
  );
}

function Scene({
  selected,
  onSelect,
  dark,
  spinning,
  compact,
}: {
  selected: string;
  onSelect: (id: string) => void;
  dark: boolean;
  spinning: boolean;
  compact: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const group = useRef<THREE.Group>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const stopDrag = useRef<(() => void) | null>(null);
  const yaw = useRef(2.95);
  const pitch = useRef(0.18);
  const lines = useMemo(() => graticule(dark ? "#9aa39c" : "#8d8680"), [dark]);

  useEffect(
    () => () => {
      lines.traverse((child) => {
        if (child instanceof THREE.Line) child.geometry.dispose();
      });
      const material = lines.children[0] instanceof THREE.Line ? lines.children[0].material : null;
      if (material instanceof THREE.Material) material.dispose();
    },
    [lines],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    if (spinning && !drag.current) yaw.current += delta * 0.08;
    group.current.rotation.y = yaw.current;
    group.current.rotation.x = pitch.current;
  });

  useEffect(() => () => stopDrag.current?.(), []);

  const onDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    stopDrag.current?.();
    drag.current = { x: event.clientX, y: event.clientY };
    moved.current = false;
    const move = (native: PointerEvent) => {
      if (!drag.current) return;
      const dx = native.clientX - drag.current.x;
      const dy = native.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
      yaw.current += dx * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.003, -0.55, 0.55);
      drag.current = { x: native.clientX, y: native.clientY };
      invalidate();
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      stopDrag.current = null;
    };
    stopDrag.current = up;
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={compact ? [1.04, 24, 16] : [1.045, 32, 32]} />
        <meshBasicMaterial color={dark ? "#6f8f88" : "#c5bfb6"} transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>
      <mesh onPointerDown={onDown}>
        <sphereGeometry args={compact ? [1, 32, 24] : [1, 48, 32]} />
        <meshStandardMaterial color={dark ? "#242220" : "#f3eee8"} roughness={0.86} metalness={0.02} />
      </mesh>
      <primitive object={lines} />
      {globeSites.map((site) => (
        <Marker key={site.id} site={site} selected={site.id === selected} onSelect={onSelect} moved={moved} />
      ))}
    </group>
  );
}

function Loop({ active, interval }: { active: boolean; interval: number }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!active) return undefined;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > interval) {
        last = now;
        invalidate();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, interval, invalidate]);

  return null;
}

function ContextWatch({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const gl = useThree((state) => state.gl);
  const onLostRef = useRef(onLost);
  const onRestoredRef = useRef(onRestored);
  onLostRef.current = onLost;
  onRestoredRef.current = onRestored;

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = "none";
    const lost = (event: Event) => {
      event.preventDefault();
      onLostRef.current();
    };
    const restored = () => {
      gl.setClearColor(0x000000, 0);
      onRestoredRef.current();
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl]);

  return null;
}

export default function NetworkGlobe({
  active,
  compact,
  selected,
  onSelect,
  dark,
  spinning,
  onReady,
  onContextLost,
}: {
  active: boolean;
  compact: boolean;
  selected: string;
  onSelect: (id: string) => void;
  dark: boolean;
  spinning: boolean;
  onReady: () => void;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      style={{ width: "100%", height: "100%", display: "block" }}
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0.2, 4.15], fov: 30 }}
      frameloop={active ? "demand" : "never"}
      gl={{
        antialias: !compact,
        alpha: true,
        powerPreference: compact ? "default" : "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
    >
      <ambientLight intensity={dark ? 0.55 : 0.85} />
      <directionalLight position={[2.6, 1.8, 3.2]} intensity={dark ? 1.15 : 1.35} color="#fff8f0" />
      <directionalLight position={[-2.2, -0.4, 1.2]} intensity={0.28} color={dark ? "#8fb8b0" : "#d7cfc4"} />
      <Scene selected={selected} onSelect={onSelect} dark={dark} spinning={spinning} compact={compact} />
      <Loop active={active && spinning} interval={compact ? 50 : 32} />
      <ContextWatch onLost={onContextLost} onRestored={onReady} />
    </Canvas>
  );
}
