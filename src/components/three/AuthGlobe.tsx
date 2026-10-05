"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { geoEquirectangular, geoGraticule, geoPath } from "d3-geo";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import landAtlas from "world-atlas/land-110m.json";
import { authArcs, authPlaces, type AuthPlace } from "@/content/authGlobe";

function latLon(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function landTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#0c1730";
  ctx.fillRect(0, 0, width, height);
  const topology = landAtlas as unknown as Topology;
  const land = feature(topology, topology.objects.land as GeometryCollection);
  const projection = geoEquirectangular().fitSize([width, height], { type: "Sphere" });
  const path = geoPath(projection, ctx);
  ctx.beginPath();
  path(geoGraticule().step([20, 20])());
  ctx.strokeStyle = "rgba(125, 206, 194, 0.16)";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.beginPath();
  path(land);
  ctx.fillStyle = "#24365f";
  ctx.fill();
  ctx.strokeStyle = "rgba(141, 232, 214, 0.55)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.flipY = false;
  return texture;
}

function glowTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.35, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function labelTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 320, 64);
  ctx.font = "500 28px ui-sans-serif, system-ui, sans-serif";
  ctx.shadowColor = "rgba(7, 11, 22, 0.95)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(232, 246, 242, 0.96)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 160, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function arcGeometry(from: AuthPlace, to: AuthPlace) {
  const start = latLon(from.lat, from.lon, 1.03);
  const end = latLon(to.lat, to.lon, 1.03);
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.32);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
}

function Marker({
  place,
  selected,
  spinning,
  onSelect,
  onHover,
  moved,
}: {
  place: AuthPlace;
  selected: boolean;
  spinning: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  moved: MutableRefObject<boolean>;
}) {
  const position = useMemo(() => latLon(place.lat, place.lon, 1.02), [place.lat, place.lon]);
  const pulse = useRef<THREE.Sprite>(null);
  const pulseMaterial = useMemo(() => {
    const map = glowTexture(place.color);
    return new THREE.SpriteMaterial({ map: map ?? undefined, transparent: true, depthWrite: false, opacity: 0.8 });
  }, [place.color]);
  useEffect(
    () => () => {
      pulseMaterial.map?.dispose();
      pulseMaterial.dispose();
    },
    [pulseMaterial],
  );

  useFrame(({ clock }) => {
    const wave = spinning ? (Math.sin(clock.elapsedTime * (selected ? 2.6 : 1.8) + place.lat) + 1) / 2 : 0.35;
    if (!pulse.current) return;
    const scale = (selected ? 0.18 : 0.11) + wave * (selected ? 0.14 : 0.07);
    pulse.current.scale.set(scale, scale, 1);
    pulseMaterial.opacity = selected ? 0.45 + (1 - wave) * 0.4 : 0.22 + (1 - wave) * 0.18;
  });

  return (
    <group>
      <group position={position}>
        <sprite ref={pulse} material={pulseMaterial} />
        <mesh
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            if (moved.current) return;
            onSelect(place.id);
          }}
          onPointerOver={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
            onHover(place.id);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
            onHover(null);
          }}
        >
          <sphereGeometry args={[selected ? 0.034 : 0.024, 16, 16]} />
          <meshBasicMaterial color={place.color} />
        </mesh>
        {selected ? (
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={place.color} transparent opacity={0.28} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

function Labels({ selected, show }: { selected: string; show: boolean }) {
  const group = useRef<THREE.Group>(null);
  const world = useRef(new THREE.Vector3());
  const projected = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());
  const labels = useMemo(
    () =>
      authPlaces.map((place) => {
        const [dLat, dLon] = place.labelShift ?? [0, 0];
        return {
          id: place.id,
          position: latLon(place.lat + dLat, place.lon + dLon, 1.2),
          material: new THREE.SpriteMaterial({
            map: labelTexture(place.label) ?? undefined,
            transparent: true,
            depthWrite: false,
          }),
        };
      }),
    [],
  );

  useEffect(
    () => () => {
      labels.forEach((label) => {
        label.material.map?.dispose();
        label.material.dispose();
      });
    },
    [labels],
  );

  useFrame(({ camera, size }) => {
    if (!group.current) return;
    const ranked: { sprite: THREE.Sprite; x: number; y: number; score: number }[] = [];
    group.current.children.forEach((child, index) => {
      const sprite = child as THREE.Sprite;
      if (!show) {
        sprite.visible = false;
        return;
      }
      sprite.getWorldPosition(world.current);
      projected.current.copy(world.current);
      const facing = world.current.normalize().dot(cameraDirection.current.copy(camera.position).normalize());
      if (facing < 0.22) {
        sprite.visible = false;
        return;
      }
      projected.current.project(camera);
      ranked.push({
        sprite,
        x: (projected.current.x * 0.5 + 0.5) * size.width,
        y: (-projected.current.y * 0.5 + 0.5) * size.height,
        score: labels[index]?.id === selected ? 10 + facing : facing,
      });
    });
    ranked.sort((a, b) => b.score - a.score);
    const kept: { x: number; y: number }[] = [];
    ranked.forEach((item) => {
      const crowded = kept.some((point) => Math.hypot(point.x - item.x, point.y - item.y) < 78);
      item.sprite.visible = !crowded;
      if (!crowded) kept.push({ x: item.x, y: item.y });
    });
  });

  if (!show) return null;

  return (
    <group ref={group}>
      {labels.map((label) => (
        <sprite key={label.id} position={label.position} material={label.material} scale={[0.42, 0.084, 1]} />
      ))}
    </group>
  );
}

function Particles({ count, spinning }: { count: number; spinning: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 1.28 + Math.random() * 0.62;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return next;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += delta * 0.04;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#b7fff0" size={0.014} transparent opacity={0.7} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Scene({
  selected,
  onSelect,
  onHover,
  spinning,
  compact,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  spinning: boolean;
  compact: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const group = useRef<THREE.Group>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const stopDrag = useRef<(() => void) | null>(null);
  const yaw = useRef(Math.PI);
  const pitch = useRef(0.16);
  const texture = useMemo(() => landTexture(), []);
  const arcs = useMemo(() => {
    return authArcs.flatMap(([fromId, toId], index) => {
      const from = authPlaces.find((place) => place.id === fromId);
      const to = authPlaces.find((place) => place.id === toId);
      if (!from || !to) return [];
      const geometry = arcGeometry(from, to);
      const material = new THREE.LineDashedMaterial({
        color: index % 2 === 0 ? "#7dcec2" : "#c4b5fd",
        transparent: true,
        opacity: 0.9,
        dashSize: 0.05,
        gapSize: 0.04,
      });
      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      material.onBeforeCompile = (shader) => {
        shader.uniforms.dashTravel = { value: 0 };
        shader.fragmentShader = `uniform float dashTravel;\n${shader.fragmentShader.replace(
          "mod( vLineDistance, totalSize )",
          "mod( vLineDistance + dashTravel, totalSize )",
        )}`;
        line.userData.shader = shader;
      };
      return [line];
    });
  }, []);

  useEffect(
    () => () => {
      texture?.dispose();
      arcs.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      document.body.style.cursor = "";
    },
    [arcs, texture],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    if (spinning && !drag.current) yaw.current += delta * 0.08;
    if (spinning) {
      arcs.forEach((line) => {
        const shader = line.userData.shader as { uniforms?: { dashTravel?: { value: number } } } | undefined;
        if (shader?.uniforms?.dashTravel) shader.uniforms.dashTravel.value -= delta * 0.22;
      });
    }
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
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.003, -0.5, 0.5);
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
        <sphereGeometry args={compact ? [1.08, 32, 24] : [1.1, 48, 32]} />
        <meshBasicMaterial color="#7dcec2" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh onPointerDown={onDown}>
        <sphereGeometry args={compact ? [1, 40, 28] : [1, 64, 40]} />
        <meshStandardMaterial map={texture ?? undefined} color={texture ? "#ffffff" : "#14213d"} roughness={0.92} metalness={0.04} />
      </mesh>
      {arcs.map((line) => (
        <primitive key={line.uuid} object={line} />
      ))}
      {authPlaces.map((place) => (
        <Marker
          key={place.id}
          place={place}
          selected={place.id === selected}
          spinning={spinning}
          onSelect={onSelect}
          onHover={onHover}
          moved={moved}
        />
      ))}
      <Labels selected={selected} show={!compact} />
      <Particles count={compact ? 36 : 80} spinning={spinning} />
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
    const restored = () => onRestoredRef.current();
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl]);

  return null;
}

export default function AuthGlobe({
  active,
  compact,
  selected,
  spinning,
  onSelect,
  onHover,
  onReady,
  onContextLost,
}: {
  active: boolean;
  compact: boolean;
  selected: string;
  spinning: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReady: () => void;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      style={{ width: "100%", height: "100%", display: "block" }}
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0.15, compact ? 3.55 : 3.15], fov: 32 }}
      frameloop={active ? "demand" : "never"}
      gl={{
        antialias: !compact,
        alpha: true,
        powerPreference: compact ? "default" : "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[2.2, 1.6, 2.4]} intensity={1.15} color="#f4f7ff" />
      <pointLight position={[-1.8, 0.4, 1.6]} intensity={compact ? 0.7 : 1.2} color="#7dcec2" distance={7} />
      <pointLight position={[1.4, -0.2, 1.2]} intensity={0.55} color="#b7a6f5" distance={6} />
      <Scene selected={selected} onSelect={onSelect} onHover={onHover} spinning={spinning} compact={compact} />
      <Loop active={active && spinning} interval={compact ? 50 : 32} />
      <ContextWatch onLost={onContextLost} onRestored={onReady} />
    </Canvas>
  );
}
