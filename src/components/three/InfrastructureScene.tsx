"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 42;
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399;
      const radius = 1.6 + (index % 5) * 0.38;
      values[index * 3] = Math.cos(angle) * radius;
      values[index * 3 + 1] = ((index % 9) - 4) * 0.38;
      values[index * 3 + 2] = Math.sin(angle) * (radius * 0.55);
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.025;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ced4da" size={0.022} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function Bay({ y, active }: { y: number; active: boolean }) {
  return (
    <group position={[0, y, 0.43]}>
      <mesh>
        <boxGeometry args={[1.12, 0.24, 0.045]} />
        <meshStandardMaterial
          color={active ? "#dee2e6" : "#f1f3f5"}
          emissive="#000000"
          emissiveIntensity={0}
          metalness={0.4}
          roughness={0.38}
        />
      </mesh>
      {[-0.46, -0.38].map((x) => (
        <mesh key={x} position={[x, 0, 0.03]}>
          <boxGeometry args={[0.035, 0.035, 0.02]} />
          <meshStandardMaterial color="#252525" emissive="#000000" emissiveIntensity={0} />
        </mesh>
      ))}
    </group>
  );
}

function Core() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.35) * 0.18;
    const targetY = 0.55 + sway + pointer.current.x * 0.22;
    const targetX = 0.08 - pointer.current.y * 0.06;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.2, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 2.2, delta);
  });

  const bays = [-1.05, -0.7, -0.35, 0, 0.35, 0.7, 1.05];
  const nodes: [number, number, number][] = [
    [-1.55, 1.05, 0.15],
    [1.75, 0.4, 0.05],
    [1.6, -1.05, 0.05],
    [-1.65, -0.75, 0],
  ];

  return (
    <group ref={group} rotation={[0.08, 0.55, 0]}>
      <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.22, 48]} />
        <meshBasicMaterial color="#dee2e6" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <boxGeometry args={[1.32, 2.62, 0.78]} />
        <meshStandardMaterial color="#e9ecef" metalness={0.15} roughness={0.55} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.04, 2.72, 0.84]} />
          <meshStandardMaterial color="#ced4da" metalness={0.12} roughness={0.5} />
        </mesh>
      ))}
      {bays.map((y, index) => (
        <Bay key={y} y={y} active={index % 2 === 0} />
      ))}
      {nodes.map((position) => (
        <mesh key={position.join("-")} position={position}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color="#f8f9fa" emissive="#000000" emissiveIntensity={0} metalness={0.05} roughness={0.45} />
        </mesh>
      ))}
      <Fibers />
      <Particles />
    </group>
  );
}

const fiberPaths: [number, number, number][][] = [
  [
    [0.55, 0.85, 0.2],
    [-0.2, 1.25, 0.55],
    [-1.55, 1.05, 0.15],
  ],
  [
    [0.58, 0.2, 0.25],
    [1.15, 0.55, 0.4],
    [1.75, 0.4, 0.05],
  ],
  [
    [0.5, -0.45, 0.25],
    [1.1, -0.95, 0.35],
    [1.6, -1.05, 0.05],
  ],
  [
    [-0.45, -0.8, 0.2],
    [-1.15, -0.55, 0.35],
    [-1.65, -0.75, 0],
  ],
];

function Fibers() {
  const lines = useMemo(
    () =>
      fiberPaths.map((points) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point)));
        const material = new THREE.LineBasicMaterial({ color: "#adb5bd", transparent: true, opacity: 0.9 });
        return new THREE.Line(geometry, material);
      }),
    [],
  );

  return (
    <>
      {lines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
    </>
  );
}

function Animator({ active }: { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!active) return undefined;
    let frame = 0;
    let raf = 0;
    const tick = () => {
      invalidate();
      frame += 1;
      if (frame < 12) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, invalidate]);

  useEffect(() => {
    if (!active) return undefined;
    let queued = false;
    const onMove = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        invalidate();
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [active, invalidate]);

  return null;
}

export default function InfrastructureScene({
  active,
  onReady,
}: {
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      className="h-full w-full"
      style={{ pointerEvents: "none" }}
      dpr={1}
      camera={{ position: [0.45, 0.05, 5.55], fov: 30 }}
      frameloop={active ? "demand" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
    >
      <ambientLight intensity={1.05} color="#ffffff" />
      <directionalLight position={[3.2, 3.4, 4]} intensity={1.05} color="#ffffff" />
      <pointLight position={[-2.2, 1.4, 2.2]} intensity={2.4} color="#7ddec8" distance={9} />
      <pointLight position={[2.2, -0.8, 1.8]} intensity={1.6} color="#c4b5fd" distance={8} />
      <Core />
      <Animator active={active} />
    </Canvas>
  );
}
