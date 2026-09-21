import { ContactShadows, Html, Sparkles, useTexture } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import { piano } from "./audio";
import {
  BLACK_H,
  BLACK_L,
  BLACK_W,
  CASE_WIDTH,
  KEY_GAP,
  KEYBOARD_WIDTH,
  LAYOUT,
  PC_TO_MIDI,
  WHITE_H,
  WHITE_L,
  WHITE_W,
  getKey,
  nextWhite,
  standPos,
  stereoPan,
  whiteKeyCut,
} from "./keys";
import { currentSong } from "./store";
import { useGame, type Judge } from "./store";
import { LISTEN_COUNT_IN_BEATS, listenCountInSec, noteHoldSec, noteOnsetSec } from "./songs";

type Jump = {
  from: number;
  to: number;
  t: number;
  dur: number;
  x0: number;
  y0: number;
  z0: number;
  x1: number;
  y1: number;
  z1: number;
  arc: number;
  kind: "hop" | "jump";
  t0: number;
  pauseT: number;
  silent: boolean;
};

export type Sim = {
  midi: number;
  x: number;
  y: number;
  z: number;
  facing: 1 | -1;
  jump: Jump | null;
  queued: number | null;
  queuedSilent: boolean;
  press: Map<number, number>;
  frame: number;
  frameT: number;
  anim: "idle" | "hop" | "jump";
  hopCool: number;
  demoClick: number;
  songTime: number;
  clockStart: number;
  pauseStart: number;
  pausedMs: number;
  idleHop: number;
  trauma: number;
  landTick: number;
  qaKeys: Set<string>;
  held: Set<string>;
  prevHeld: Set<string>;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function sat(t: number) {
  return Math.max(0, Math.min(1, t));
}
function damp(cur: number, target: number, lambda: number, dt: number) {
  return lerp(cur, target, 1 - Math.exp(-lambda * dt));
}
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function prefersReduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function makeSim(): Sim {
  const p = standPos(60);
  return {
    midi: 60,
    x: p.x,
    y: p.y,
    z: p.z,
    facing: 1,
    jump: null,
    queued: null,
    queuedSilent: false,
    press: new Map(),
    frame: 0,
    frameT: 0,
    anim: "idle",
    hopCool: 0,
    demoClick: 0,
    songTime: 0,
    clockStart: 0,
    pauseStart: 0,
    pausedMs: 0,
    idleHop: 4.2,
    trauma: 0,
    landTick: 0,
    qaKeys: new Set(),
    held: new Set(),
    prevHeld: new Set(),
  };
}

function setSheetFrame(tex: THREE.Texture, frame: number) {
  const col = frame % 2;
  const row = Math.floor(frame / 2);
  tex.repeat.set(0.5, 0.5);
  tex.offset.set(col * 0.5, 0.5 - row * 0.5);
}

export function PianoWorld() {
  const sim = useRef<Sim>(makeSim());
  const cam = useRef({ x: 0.35, y: 1.85, z: 4.85, lx: 0.05, ly: 0.42, lz: 0.45 });
  const playId = useGame((s) => s.playId);

  useLayoutEffect(() => {
    const song = currentSong();
    const mode = useGame.getState().mode;
    const target = song?.notes[0]?.midi ?? 60;
    const startMidi = mode === "free" ? 60 : (nextWhite(target, -1)?.midi ?? target);
    const p = standPos(startMidi);
    const s = sim.current;
    s.midi = startMidi;
    s.x = p.x;
    s.y = p.y;
    s.z = p.z;
    s.jump = null;
    s.queued = null;
    s.queuedSilent = false;
    s.demoClick = 0;
    s.songTime = 0;
    s.clockStart = 0;
    s.pauseStart = 0;
    s.pausedMs = 0;
    s.anim = "idle";
    s.trauma = 0;
    if (mode === "free") {
      const home = standPos(60);
      s.midi = 60;
      s.x = home.x;
      s.y = home.y;
      s.z = home.z;
    }
  }, [playId]);

  useEffect(() => {
    window.__controlsTest = {
      getYaw: () => 0,
      getX: () => sim.current.x,
      getSpeed: () => (sim.current.jump ? 1 : 0),
      getMidi: () => sim.current.midi,
      setKeys: (codes) => {
        sim.current.qaKeys = new Set(codes);
      },
    };
    return () => {
      delete window.__controlsTest;
    };
  }, []);

  return (
    <>
      <color attach="background" args={["#0c0b0a"]} />
      <fog attach="fog" args={["#0c0b0a", 18, 42]} />
      <Lights />
      <Hall />
      <StageFloor />
      <PianoCase />
      <Keys sim={sim} />
      <GlowBeacons />
      <TargetArrow />
      <Maestro sim={sim} />
      <HitBurst sim={sim} />
      <LandDust sim={sim} />
      <CameraRig sim={sim} cam={cam} />
      <ContactShadows position={[0, -1.2, 0.2]} opacity={0.45} scale={14} blur={2.2} far={3.5} />
      <Sparkles count={prefersReduced() ? 0 : 48} scale={[12, 3.2, 7]} size={2.2} speed={0.28} opacity={0.36} color="#e8dfd0" />
      <InputHost sim={sim} />
    </>
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#f0d4a8", "#16110f", 0.55]} />
      <ambientLight intensity={0.2} />
      <spotLight
        position={[1.8, 7.4, 5.2]}
        angle={0.5}
        penumbra={0.72}
        intensity={95}
        distance={26}
        color="#ffe4c2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />
      <spotLight position={[-5.2, 4.6, 2.2]} angle={0.55} penumbra={0.85} intensity={22} color="#9bb3c4" />
      <spotLight position={[0, 6.8, 1.6]} angle={0.38} penumbra={0.9} intensity={28} color="#ffd7a8" />
      <pointLight position={[0, 2.1, 1.2]} intensity={7} color="#f3ece0" distance={10} />
    </>
  );
}

function Hall() {
  const map = useTexture("/game/hall.jpg");
  const curtain = useTexture("/game/curtain.jpg");
  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    curtain.colorSpace = THREE.SRGBColorSpace;
    curtain.anisotropy = 8;
    curtain.offset.set(0, 0.08);
    curtain.repeat.set(1, 0.92);
  }, [map, curtain]);
  return (
    <>
      <mesh position={[0, 3.45, -10.4]}>
        <planeGeometry args={[21.4, 12]} />
        <meshBasicMaterial map={map} />
      </mesh>
      <mesh position={[-9.6, 2.35, -5.6]} rotation={[0, 0.42, 0]}>
        <planeGeometry args={[4.6, 8]} />
        <meshBasicMaterial map={curtain} />
      </mesh>
      <mesh position={[9.6, 2.35, -5.6]} rotation={[0, -0.42, 0]} scale={[-1, 1, 1]}>
        <planeGeometry args={[4.6, 8]} />
        <meshBasicMaterial map={curtain} />
      </mesh>
    </>
  );
}

function StageFloor() {
  const map = useTexture("/game/textures/stage.jpg");
  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2.4, 2.4);
    map.anisotropy = 8;
  }, [map]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.22, 0.4]} receiveShadow>
      <planeGeometry args={[28, 22]} />
      <meshStandardMaterial map={map} roughness={0.55} metalness={0.08} color="#1a1614" />
    </mesh>
  );
}

function GlowBeacons() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const shaft = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const ghosts = useRef<[THREE.Group | null, THREE.Group | null]>([null, null]);

  useFrame((state) => {
    const st = useGame.getState();
    const song = currentSong();
    const playing = st.screen === "play" && st.mode !== "free" && !st.finished && !st.paused;
    const next = song?.notes[st.noteIndex];
    const pulse = 0.55 + 0.45 * Math.sin(state.clock.elapsedTime * 5.2);

    if (group.current) {
      if (playing && next) {
        const p = standPos(next.midi);
        const key = getKey(next.midi);
        group.current.visible = true;
        group.current.position.set(key.x, p.y + 0.02, p.z);
        if (ring.current) ring.current.opacity = 0.45 + pulse * 0.5;
        if (shaft.current) shaft.current.opacity = 0.22 + pulse * 0.22;
        if (light.current) light.current.intensity = 5.5 + pulse * 6;
      } else {
        group.current.visible = false;
      }
    }

    const extras = [song?.notes[st.noteIndex + 1], song?.notes[st.noteIndex + 2]];
    extras.forEach((note, i) => {
      const g = ghosts.current[i];
      if (!g) return;
      if (playing && st.mode === "learn" && note) {
        const p = standPos(note.midi);
        const key = getKey(note.midi);
        g.visible = true;
        g.position.set(key.x, p.y + 0.02, p.z);
        g.scale.setScalar(0.72 - i * 0.12);
      } else {
        g.visible = false;
      }
    });
  });

  return (
    <>
      <group ref={group} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[0.055, 0.15, 28]} />
          <meshBasicMaterial ref={ring} color="#7dcec4" transparent opacity={0.7} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.034, 0.1, 1.42, 12]} />
          <meshBasicMaterial ref={shaft} color="#9ee8dc" transparent opacity={0.32} depthWrite={false} />
        </mesh>
        <pointLight ref={light} color="#7dcec4" distance={2.6} intensity={6} />
      </group>
      <group
        ref={(el) => {
          ghosts.current[0] = el;
        }}
        visible={false}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.11, 20]} />
          <meshBasicMaterial color="#5aa89c" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
      <group
        ref={(el) => {
          ghosts.current[1] = el;
        }}
        visible={false}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.1, 20]} />
          <meshBasicMaterial color="#3d7a72" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

function PianoCase() {
  const w = CASE_WIDTH;
  return (
    <group>
      <mesh position={[0, -0.08, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.22, 2.55]} />
        <meshPhysicalMaterial
          color="#0e0d0c"
          roughness={0.2}
          metalness={0.32}
          clearcoat={1}
          clearcoatRoughness={0.14}
        />
      </mesh>
      <mesh position={[0, 0.42, -1.72]} castShadow>
        <boxGeometry args={[w, 0.95, 0.22]} />
        <meshPhysicalMaterial color="#0e0d0c" roughness={0.2} metalness={0.3} clearcoat={1} clearcoatRoughness={0.14} />
      </mesh>
      <mesh position={[0, 1.55, -1.55]} rotation={[Math.PI * -0.58, 0, 0]} castShadow>
        <boxGeometry args={[w - 0.08, 0.045, 2.15]} />
        <meshPhysicalMaterial
          color="#121110"
          roughness={0.16}
          metalness={0.38}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.72, -1.62]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.04, 1.35, 0.04]} />
        <meshStandardMaterial color="#b39868" metalness={1} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.08, -0.02]} receiveShadow>
        <boxGeometry args={[w - 0.12, 0.06, WHITE_L + 0.08]} />
        <meshStandardMaterial color="#1a1816" roughness={0.5} />
      </mesh>
      <mesh position={[0, WHITE_H + 0.003, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KEYBOARD_WIDTH - 0.08, 0.05]} />
        <meshStandardMaterial color="#6e1e24" roughness={0.92} />
      </mesh>
      {[
        [-w * 0.38, -0.66, 0.35],
        [w * 0.38, -0.66, 0.35],
        [0, -0.66, -1.55],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.055, 0.07, 1.12, 12]} />
            <meshPhysicalMaterial color="#0e0d0c" roughness={0.22} metalness={0.3} clearcoat={0.8} />
          </mesh>
          <mesh position={[0, -0.58, 0]}>
            <cylinderGeometry args={[0.11, 0.12, 0.06, 16]} />
            <meshStandardMaterial color="#b39868" metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <SheetDesk />
    </group>
  );
}

function SheetDesk() {
  const song = useGame((s) => (s.songId ? s.songId : "free"));
  const title = song === "free" ? "Free Play" : (currentSong()?.title ?? "Ivory Hopper");
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 360;
    const g = c.getContext("2d");
    if (!g) return new THREE.CanvasTexture(c);
    g.fillStyle = "#f4eee4";
    g.fillRect(0, 0, 512, 360);
    g.strokeStyle = "#2c2824";
    g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = 138 + i * 22;
      g.beginPath();
      g.moveTo(48, y);
      g.lineTo(464, y);
      g.stroke();
    }
    g.fillStyle = "#1a1814";
    g.font = '600 34px "Cormorant Garamond", serif';
    g.textAlign = "center";
    g.fillText(title, 256, 78);
    g.font = "500 16px Figtree, sans-serif";
    g.fillStyle = "#6e6860";
    g.fillText("Ivory Hopper", 256, 318);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [title]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <mesh position={[-0.38, 0.95, -0.22]} rotation={[0.1, 0, 0.08]}>
        <boxGeometry args={[0.03, 0.55, 0.03]} />
        <meshStandardMaterial color="#1a1816" />
      </mesh>
      <mesh position={[0.38, 0.95, -0.22]} rotation={[0.1, 0, -0.08]}>
        <boxGeometry args={[0.03, 0.55, 0.03]} />
        <meshStandardMaterial color="#1a1816" />
      </mesh>
      <mesh position={[0, 1.18, -0.16]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[0.95, 0.66]} />
        <meshStandardMaterial map={tex} roughness={0.72} />
      </mesh>
    </group>
  );
}

const labelCache = new Map<string, THREE.CanvasTexture>();

function labelTexture(text: string) {
  const hit = labelCache.get(text);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = "#4a453e";
    g.font = "600 26px Figtree, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 32, 34);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  labelCache.set(text, t);
  return t;
}

function Keys({ sim }: { sim: MutableRefObject<Sim> }) {
  const ivory = useTexture("/game/textures/ivory.jpg");
  const ebony = useTexture("/game/textures/ebony.jpg");
  const groups = useRef<THREE.Group[]>([]);
  const materials = useMemo(
    () =>
      LAYOUT.map(
        (key) =>
          new THREE.MeshPhysicalMaterial({
            color: key.isBlack ? "#0a0909" : "#f3eee6",
            roughness: key.isBlack ? 0.24 : 0.4,
            metalness: key.isBlack ? 0.16 : 0.04,
            clearcoat: key.isBlack ? 1 : 0.58,
            clearcoatRoughness: key.isBlack ? 0.1 : 0.26,
            emissive: new THREE.Color("#000000"),
            emissiveIntensity: 0,
          }),
      ),
    [],
  );

  useLayoutEffect(() => {
    ivory.colorSpace = THREE.SRGBColorSpace;
    ebony.colorSpace = THREE.SRGBColorSpace;
    ivory.wrapS = ivory.wrapT = THREE.RepeatWrapping;
    ebony.wrapS = ebony.wrapT = THREE.RepeatWrapping;
    ivory.repeat.set(0.55, 1.6);
    ebony.repeat.set(0.7, 1.4);
    ivory.anisotropy = 8;
    ebony.anisotropy = 8;
    LAYOUT.forEach((key, i) => {
      const mat = materials[i];
      if (!mat) return;
      mat.map = key.isBlack ? ebony : ivory;
      mat.needsUpdate = true;
    });
  }, [ivory, ebony, materials]);

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  const onKey = (midi: number) => {
    requestJump(sim.current, midi);
  };

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const s = sim.current;
    const st = useGame.getState();
    const song = currentSong();
    const next = song?.notes[st.noteIndex];
    const n1 = song?.notes[st.noteIndex + 1];
    const n2 = song?.notes[st.noteIndex + 2];
    const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.006);

    LAYOUT.forEach((key, i) => {
      const g = groups.current[i];
      const mat = materials[i];
      if (!g || !mat) return;
      const press = s.press.get(key.midi) ?? 0;
      s.press.set(key.midi, Math.max(0, press - dt * 3.4));
      const amount = s.press.get(key.midi) ?? 0;
      const baseY = key.isBlack ? WHITE_H + BLACK_H / 2 : WHITE_H / 2;
      g.position.y = baseY - amount * 0.038;
      g.rotation.x = amount * 0.055;

      let er = 0,
        eg = 0,
        eb = 0,
        em = 0;
      const playing = st.screen === "play" && st.mode !== "free" && !st.finished;
      if (playing && next && key.midi === next.midi) {
        er = 0.32 * pulse;
        eg = 0.86 * pulse;
        eb = 0.74 * pulse;
        em = 1.15;
      } else if (playing && st.mode === "learn" && n1 && key.midi === n1.midi) {
        er = 0.12;
        eg = 0.4;
        eb = 0.34;
        em = 0.42;
      } else if (playing && st.mode === "learn" && n2 && key.midi === n2.midi) {
        er = 0.06;
        eg = 0.2;
        eb = 0.17;
        em = 0.22;
      }
      if (amount > 0.2) {
        er = Math.max(er, 0.62);
        eg = Math.max(eg, 0.52);
        eb = Math.max(eb, 0.38);
        em = Math.max(em, 0.82);
      }
      mat.emissive.setRGB(er, eg, eb);
      mat.emissiveIntensity = em;
    });
  });

  return (
    <group>
      {LAYOUT.map((key, i) => {
        const mat = materials[i]!;
        const z = key.isBlack ? BLACK_L / 2 - 0.02 : WHITE_L / 2;
        return (
          <group
            key={key.midi}
            ref={(el) => {
              if (el) groups.current[i] = el;
            }}
            position={[key.x, key.isBlack ? WHITE_H + BLACK_H / 2 : WHITE_H / 2, z]}
          >
            {key.isBlack ? (
              <KeyMesh
                args={[BLACK_W, BLACK_H, BLACK_L]}
                material={mat}
                midi={key.midi}
                onKey={onKey}
              />
            ) : (
              <WhiteKeyMeshes midi={key.midi} material={mat} onKey={onKey} />
            )}
            {!key.isBlack && (
              <mesh position={[0, WHITE_H / 2 + 0.001, WHITE_L / 2 - 0.16]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[(WHITE_W - KEY_GAP) * 0.72, 0.11]} />
                <meshBasicMaterial map={labelTexture(key.short)} transparent depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
      <TargetLabel sim={sim} />
    </group>
  );
}

function pointerBind(midi: number, onKey: (midi: number) => void) {
  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onKey(midi);
    },
    onPointerOver: () => {
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "auto";
    },
  };
}

function KeyMesh({
  args,
  material,
  midi,
  onKey,
}: {
  args: [number, number, number];
  material: THREE.MeshPhysicalMaterial;
  midi: number;
  onKey: (midi: number) => void;
}) {
  return (
    <mesh castShadow receiveShadow material={material} {...pointerBind(midi, onKey)}>
      <boxGeometry args={args} />
    </mesh>
  );
}

function WhiteKeyMeshes({
  midi,
  material,
  onKey,
}: {
  midi: number;
  material: THREE.MeshPhysicalMaterial;
  onKey: (midi: number) => void;
}) {
  const { left, right } = whiteKeyCut(midi);
  const W = WHITE_W - KEY_GAP;
  const frontL = WHITE_L - BLACK_L + 0.03;
  const backW = Math.max(0.04, W - left - right);
  const backX = (left - right) / 2;
  const backZ = -WHITE_L / 2 + BLACK_L / 2;
  const frontZ = WHITE_L / 2 - frontL / 2;
  const bind = pointerBind(midi, onKey);
  return (
    <>
      <mesh
        position={[backX, 0, backZ]}
        castShadow
        receiveShadow
        material={material}
        {...bind}
      >
        <boxGeometry args={[backW, WHITE_H, BLACK_L]} />
      </mesh>
      <mesh position={[0, 0, frontZ]} castShadow receiveShadow material={material} {...bind}>
        <boxGeometry args={[W, WHITE_H, frontL]} />
      </mesh>
    </>
  );
}

function TargetArrow() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const st = useGame.getState();
    const song = currentSong();
    const next = song?.notes[st.noteIndex];
    const playing = st.screen === "play" && st.mode !== "free" && !st.finished && !st.paused;
    if (playing && next) {
      const p = standPos(next.midi);
      const key = getKey(next.midi);
      const bob = prefersReduced() ? 0 : Math.sin(state.clock.elapsedTime * 6.2) * 0.07;
      g.visible = true;
      g.position.set(key.x, p.y + 0.58 + bob, p.z);
    } else {
      g.visible = false;
    }
  });
  return (
    <group ref={ref} visible={false}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.055, 0.13, 4]} />
        <meshBasicMaterial color="#7dcec4" />
      </mesh>
    </group>
  );
}

function LandDust({ sim }: { sim: MutableRefObject<Sim> }) {
  const count = 16;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seen = useRef(0);
  const parts = useRef(
    Array.from({ length: count }, () => ({
      life: 0,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vz: 0,
      max: 0.4,
    })),
  );

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const s = sim.current;
    const im = mesh.current;
    if (!im) return;
    if (s.landTick !== seen.current) {
      seen.current = s.landTick;
      parts.current.forEach((p, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        const spd = 0.35 + Math.random() * 0.4;
        p.life = 0.32 + Math.random() * 0.14;
        p.max = p.life;
        p.x = s.x;
        p.y = s.y + 0.03;
        p.z = s.z;
        p.vx = Math.cos(a) * spd;
        p.vz = Math.sin(a) * spd;
      });
    }
    parts.current.forEach((p, i) => {
      if (p.life <= 0) {
        dummy.scale.set(0, 0, 0);
      } else {
        p.life -= dt;
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        p.y += dt * 0.18;
        const u = 1 - Math.max(0, p.life) / p.max;
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(0.028 + u * 0.07);
      }
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#e8dfd0" transparent opacity={0.42} depthWrite={false} />
    </instancedMesh>
  );
}

function TargetLabel({ sim }: { sim: MutableRefObject<Sim> }) {
  const show = useGame((s) => s.showNames && s.screen === "play" && s.mode !== "free" && !s.paused);
  const noteIndex = useGame((s) => s.noteIndex);
  const song = currentSong();
  const next = song?.notes[noteIndex];
  if (!show || !next) return null;
  const key = getKey(next.midi);
  const p = standPos(next.midi);
  void sim;
  return (
    <Html
      position={[key.x, p.y + 0.42, p.z]}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[10, 0]}
    >
      <div className="rounded-full bg-accent/92 px-2.5 py-0.5 font-display text-[13px] tracking-wide text-accent-fg shadow-panel">
        {key.short}
      </div>
    </Html>
  );
}

function Maestro({ sim }: { sim: MutableRefObject<Sim> }) {
  const idle = useTexture("/game/maestro-idle.png");
  const jump = useTexture("/game/maestro-jump.png");
  const hop = useTexture("/game/maestro-hop.png");
  const sprite = useRef<THREE.Sprite>(null);
  const blob = useRef<THREE.Mesh>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const maps = useMemo(() => ({ idle, jump, hop }), [idle, jump, hop]);

  useLayoutEffect(() => {
    for (const t of [idle, jump, hop]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.repeat.set(0.5, 0.5);
      t.offset.set(0, 0.5);
    }
  }, [idle, jump, hop]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const s = sim.current;
    s.frameT += dt;
    const fps = s.anim === "idle" ? 5 : 10;
    if (s.frameT > 1 / fps) {
      s.frameT = 0;
      s.frame = (s.frame + 1) % 4;
    }
    let tex = maps.idle;
    let frame = s.frame;
    if (s.jump) {
      const u = s.jump.t / s.jump.dur;
      tex = s.jump.kind === "hop" ? maps.hop : maps.jump;
      frame = sat(u) < 0.18 ? 0 : sat(u) < 0.45 ? 1 : sat(u) < 0.78 ? 2 : 3;
    } else {
      tex = maps.idle;
    }
    setSheetFrame(tex, frame);
    const sp = sprite.current;
    if (sp) {
      sp.material.map = tex;
      sp.material.needsUpdate = true;
      let sy = 1.05;
      let sx = 0.8 * s.facing;
      if (s.jump) {
        const u = sat(s.jump.t / s.jump.dur);
        if (u < 0.12) {
          sy *= 0.86;
          sx *= 1.14;
        } else if (u < 0.55) {
          sy *= 1.14;
          sx *= 0.88;
        }
      } else {
        const land = s.press.get(s.midi) ?? 0;
        sy *= 1 - land * 0.14;
        sx *= 1 + land * 0.12;
        sy *= 1 + Math.sin(performance.now() * 0.004) * 0.015;
      }
      sp.scale.set(sx, sy, 1);
      sp.position.set(s.x, s.y + Math.abs(sy) * 0.5 - 0.01, s.z);
    }
    if (blob.current) {
      blob.current.position.set(s.x, s.y + 0.01, s.z + 0.02);
      const sc = 0.22 * (s.jump ? 0.55 : 1);
      blob.current.scale.set(sc, sc, sc);
    }
    if (lamp.current) {
      lamp.current.position.set(s.x, s.y + 0.95, s.z + 0.28);
    }
  });

  return (
    <group>
      <sprite ref={sprite} scale={[0.8, 1.05, 1]} renderOrder={2}>
        <spriteMaterial transparent alphaTest={0.18} depthWrite={false} />
      </sprite>
      <mesh ref={blob} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[1, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.32} />
      </mesh>
      <pointLight ref={lamp} color="#ffe6c8" intensity={2.6} distance={3.1} />
    </group>
  );
}

function HitBurst({ sim }: { sim: MutableRefObject<Sim> }) {
  const tex = useTexture("/game/sparkle.png");
  const sprite = useRef<THREE.Sprite>(null);
  const life = useRef(0);
  useLayoutEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.repeat.set(0.5, 0.5);
  }, [tex]);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const sp = sprite.current;
    if (!sp) return;
    if (life.current > 0) {
      life.current -= dt;
      const u = 1 - sat(life.current / 0.38);
      const frame = u < 0.25 ? 0 : u < 0.5 ? 1 : u < 0.75 ? 2 : 3;
      setSheetFrame(tex, frame);
      const sc = 0.35 + u * 0.55;
      sp.scale.set(sc, sc, 1);
      sp.material.opacity = 1 - u;
      sp.visible = true;
      sp.position.set(sim.current.x, sim.current.y + 0.35, sim.current.z + 0.04);
    } else {
      sp.visible = false;
    }
    const press = sim.current.press.get(sim.current.midi) ?? 0;
    if (press > 0.85 && life.current <= 0) life.current = 0.38;
  });
  return (
    <sprite ref={sprite} visible={false} renderOrder={3}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  );
}

function CameraRig({
  sim,
  cam,
}: {
  sim: MutableRefObject<Sim>;
  cam: MutableRefObject<{ x: number; y: number; z: number; lx: number; ly: number; lz: number }>;
}) {
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.1);
    const s = sim.current;
    const st = useGame.getState();
    const mobile = state.size.width < 640;
    const wide = st.camWide;
    const lookX = wide ? 0 : s.x;
    const song = currentSong();
    const next = song?.notes[st.noteIndex];
    const lead = !wide && next ? getKey(next.midi).x : lookX;
    const mixX = wide ? 0 : lerp(s.x, lead, 0.28);
    const goal = wide
      ? { x: 0.35, y: 1.85, z: mobile ? 5.6 : 4.85, lx: 0.05, ly: 0.42, lz: 0.45 }
      : {
          x: mixX + 0.12,
          y: mobile ? 2.15 : 1.85,
          z: mobile ? 3.9 : 3.35,
          lx: mixX,
          ly: 0.42,
          lz: 0.45,
        };
    if ((st.screen === "title" || st.screen === "songs" || st.screen === "howto") && !prefersReduced()) {
      const t = state.clock.elapsedTime;
      goal.z += Math.sin(t * 0.22) * 0.14;
      goal.y += Math.sin(t * 0.17) * 0.05;
    }
    const c = cam.current;
    c.x = damp(c.x, goal.x, 3.2, dt);
    c.y = damp(c.y, goal.y, 3.2, dt);
    c.z = damp(c.z, goal.z, 3.2, dt);
    c.lx = damp(c.lx, goal.lx, 3.6, dt);
    c.ly = damp(c.ly, goal.ly, 3.6, dt);
    c.lz = damp(c.lz, goal.lz, 3.6, dt);
    s.trauma = Math.max(0, s.trauma - dt * 2.8);
    const shakeOn = st.shake && !prefersReduced();
    const sh = shakeOn ? s.trauma * s.trauma : 0;
    const t = state.clock.elapsedTime;
    state.camera.position.set(c.x + Math.sin(t * 61) * sh * 0.08, c.y + Math.cos(t * 53) * sh * 0.05, c.z);
    state.camera.lookAt(c.lx, c.ly, c.lz);
  });
  return null;
}

function InputHost({ sim }: { sim: MutableRefObject<Sim> }) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      sim.current.held.add(e.code);
      if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code) || PC_TO_MIDI[e.code]) {
        e.preventDefault();
      }
      if (e.code === "Escape") {
        const st = useGame.getState();
        if (st.screen === "play") st.pause(!st.paused);
      }
    };
    const up = (e: KeyboardEvent) => sim.current.held.delete(e.code);
    const clear = () => sim.current.held.clear();
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [sim]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const s = sim.current;
    const st = useGame.getState();
    const listening = st.mode === "demo" && st.screen === "play" && !st.finished;

    if (listening) {
      s.songTime = listenClock(s, st.paused);
    }
    stepJump(s, dt, st.paused, listening);
    if (st.paused) return;

    const pending = st.pendingMidi;
    if (pending != null && st.mode !== "demo") {
      useGame.getState().consumeHop();
      requestJump(s, pending);
    } else if (pending != null && st.mode === "demo") {
      useGame.getState().consumeHop();
    }

    const codes = new Set<string>([...s.held, ...s.qaKeys]);
    const just = (code: string) => codes.has(code) && !s.prevHeld.has(code);
    s.hopCool = Math.max(0, s.hopCool - dt);

    if (listening) {
      stepListen(s);
      s.prevHeld = new Set(codes);
      return;
    }

    const left = codes.has("ArrowLeft");
    const right = codes.has("ArrowRight");
    if ((just("ArrowLeft") || (left && s.hopCool === 0 && s.qaKeys.size > 0)) && !s.jump) {
      const n = nextWhite(s.midi, -1);
      if (n) requestJump(s, n.midi);
      s.hopCool = 0.22;
    }
    if ((just("ArrowRight") || (right && s.hopCool === 0 && s.qaKeys.size > 0)) && !s.jump) {
      const n = nextWhite(s.midi, 1);
      if (n) requestJump(s, n.midi);
      s.hopCool = 0.22;
    }
    if ((left || right) && s.hopCool === 0 && !s.jump) {
      const n = nextWhite(s.midi, left ? -1 : 1);
      if (n) requestJump(s, n.midi);
      s.hopCool = 0.24;
    }

    const struck: number[] = [];
    for (const code of codes) {
      if (!just(code)) continue;
      const mapped = PC_TO_MIDI[code];
      if (mapped == null) continue;
      strikeKey(s, mapped);
      struck.push(mapped);
    }
    if (struck.length) {
      const song = currentSong();
      const expected = song?.notes[useGame.getState().noteIndex]?.midi;
      const target = expected != null && struck.includes(expected) ? expected : struck[struck.length - 1]!;
      requestJump(s, target, undefined, true);
    }

    if (just("Space") || just("Enter")) {
      const song = currentSong();
      const next = song?.notes[st.noteIndex];
      if (st.screen === "play" && st.mode === "learn" && next) {
        requestJump(s, next.midi);
      } else {
        requestJump(s, s.midi);
      }
    }

    if ((st.screen === "title" || st.screen === "songs" || st.screen === "howto") && !s.jump) {
      s.idleHop -= dt;
      if (s.idleHop <= 0) {
        const n = nextWhite(s.midi, Math.random() > 0.5 ? 1 : -1);
        requestJump(s, n?.midi ?? s.midi);
        s.idleHop = 3.4 + Math.random() * 2.4;
      }
    }

    if (st.screen === "play" && !st.finished && st.mode !== "free") s.songTime += dt;
    s.prevHeld = new Set(codes);
  });
  return null;
}

function listenClock(s: Sim, paused: boolean) {
  const now = performance.now();
  if (!s.clockStart) s.clockStart = now;
  if (paused) {
    if (!s.pauseStart) s.pauseStart = now;
    return (s.pauseStart - s.clockStart - s.pausedMs) / 1000;
  }
  if (s.pauseStart) {
    s.pausedMs += now - s.pauseStart;
    s.pauseStart = 0;
  }
  return (now - s.clockStart - s.pausedMs) / 1000;
}

function hopDuration(fromMidi: number, toMidi: number) {
  const from = standPos(fromMidi);
  const to = standPos(toMidi);
  const dist = Math.abs(to.x - from.x);
  if (prefersReduced()) return 0.12;
  if (toMidi === fromMidi) return 0.2;
  return Math.min(0.55, 0.16 + dist * 0.1);
}

function stepListen(s: Sim) {
  const song = currentSong();
  if (!song) return;
  const beat = 60 / song.bpm;
  while (s.demoClick < LISTEN_COUNT_IN_BEATS && s.songTime >= s.demoClick * beat - 0.0001) {
    piano.countTick(s.demoClick === 0);
    s.demoClick += 1;
  }
  if (s.jump) return;
  const noteIndex = useGame.getState().noteIndex;
  const next = song.notes[noteIndex];
  if (!next) return;
  const onset = listenCountInSec(song) + noteOnsetSec(song, noteIndex);
  const natural = hopDuration(s.midi, next.midi);
  const startAt = onset - natural;
  if (s.songTime + 0.0001 < startAt) return;
  const remaining = Math.max(0.08, onset - s.songTime);
  requestJump(s, next.midi, Math.min(natural, remaining));
}

function requestJump(s: Sim, midi: number, dur?: number, silent = false) {
  if (s.jump) {
    if (useGame.getState().mode === "demo") return;
    s.queued = midi;
    s.queuedSilent = silent;
    return;
  }
  startJump(s, midi, dur, silent);
}

function startJump(s: Sim, midi: number, durOverride?: number, silent = false) {
  const from = standPos(s.midi);
  const to = standPos(midi);
  const dist = Math.abs(to.x - from.x);
  const reduced = prefersReduced();
  const same = midi === s.midi;
  const dur =
    durOverride ?? (reduced ? 0.14 : same ? 0.28 : Math.min(0.7, 0.24 + dist * 0.12));
  const arc = reduced ? 0.12 : same ? 0.36 : Math.min(1.05, 0.26 + dist * 0.24);
  s.facing = to.x === from.x ? s.facing : to.x > from.x ? 1 : -1;
  s.anim = dist < 0.45 ? "hop" : "jump";
  s.frame = 0;
  s.frameT = 0;
  s.jump = {
    from: s.midi,
    to: midi,
    t: 0,
    dur,
    x0: from.x,
    y0: from.y,
    z0: from.z,
    x1: to.x,
    y1: to.y,
    z1: to.z,
    arc,
    kind: dist < 0.45 ? "hop" : "jump",
    t0: performance.now(),
    pauseT: 0,
    silent,
  };
  if (!silent && dur >= 0.16) piano.whoosh();
}

function stepJump(s: Sim, dt: number, paused: boolean, listening = false) {
  const j = s.jump;
  if (!j) return;
  if (paused) {
    if (listening && !j.pauseT) j.pauseT = performance.now();
    return;
  }
  if (listening) {
    if (j.pauseT) {
      j.t0 += performance.now() - j.pauseT;
      j.pauseT = 0;
    }
    j.t = (performance.now() - j.t0) / 1000;
  } else {
    j.t += dt;
  }
  const u = sat(j.t / j.dur);
  const h = easeInOut(u);
  s.x = lerp(j.x0, j.x1, h);
  s.z = lerp(j.z0, j.z1, h);
  s.y = lerp(j.y0, j.y1, h) + 4 * j.arc * u * (1 - u);
  if (u >= 1) {
    s.jump = null;
    s.midi = j.to;
    const p = standPos(j.to);
    s.x = p.x;
    s.y = p.y;
    s.z = p.z;
    s.anim = "idle";
    land(s, j.to, j.silent);
    if (s.queued != null && useGame.getState().mode !== "demo") {
      const q = s.queued;
      const qs = s.queuedSilent;
      s.queued = null;
      s.queuedSilent = false;
      startJump(s, q, undefined, qs);
    } else {
      s.queued = null;
      s.queuedSilent = false;
    }
  }
}

function strikeKey(s: Sim, midi: number) {
  s.press.set(midi, 1);
  s.trauma = Math.min(1, s.trauma + 0.22);
  s.landTick += 1;
  const key = getKey(midi);
  piano.play(midi, 0.84, stereoPan(key.x));
  judgeKeyboard(s, midi);
}

function judgeKeyboard(s: Sim, midi: number) {
  const st = useGame.getState();
  if (st.screen !== "play" || st.finished || st.mode === "free" || st.mode === "demo") return;
  const song = currentSong();
  if (!song) return;
  const expected = song.notes[st.noteIndex];
  if (!expected || midi !== expected.midi) return;
  let judge: Judge = "hit";
  if (st.mode === "recital") {
    const expectedTime = song.notes.slice(0, st.noteIndex).reduce((n, x) => n + x.beats, 0) * (60 / song.bpm);
    const delta = Math.abs(s.songTime - expectedTime);
    judge = delta < 0.16 ? "perfect" : delta < 0.34 ? "good" : "ok";
  }
  st.registerHit(judge);
  const after = useGame.getState();
  if (after.noteIndex >= song.notes.length) {
    window.setTimeout(() => useGame.getState().finish(), 650);
  }
}

function land(s: Sim, midi: number, silent = false) {
  s.press.set(midi, 1);
  s.trauma = Math.min(1, s.trauma + 0.28);
  s.landTick += 1;
  if (silent) return;
  const key = getKey(midi);
  const st = useGame.getState();
  const song = st.screen === "play" && !st.finished ? currentSong() : undefined;
  const expected = song?.notes[st.noteIndex];
  const hold = st.mode === "demo" && song ? noteHoldSec(song, st.noteIndex) : undefined;
  piano.play(midi, 0.84, stereoPan(key.x), hold);

  if (st.screen !== "play" || st.finished || st.mode === "free") return;
  if (!song) return;
  if (!expected) return;

  if (midi === expected.midi) {
    let judge: Judge = "hit";
    if (st.mode === "recital") {
      const expectedTime = song.notes.slice(0, st.noteIndex).reduce((n, x) => n + x.beats, 0) * (60 / song.bpm);
      const delta = Math.abs(s.songTime - expectedTime);
      judge = delta < 0.16 ? "perfect" : delta < 0.34 ? "good" : "ok";
    }
    st.registerHit(judge);
    const after = useGame.getState();
    if (after.noteIndex >= song.notes.length) {
      window.setTimeout(() => useGame.getState().finish(), 650);
    }
  } else if (st.mode === "recital") {
    st.registerMiss();
  } else if (st.mode === "learn") {
    st.registerMiss();
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getX: () => number;
      getSpeed: () => number;
      getMidi: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}
