import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { PianoWorld } from "./PianoWorld";
import { Overlays } from "./overlays";
import { piano, resumeOnVisible } from "./audio";
import { useGame } from "./store";

export default function GameApp() {
  useEffect(() => {
    useGame.getState().unlock();
    resumeOnVisible();
    const kick = () => {
      piano.unlock();
      useGame.getState().unlock();
    };
    window.addEventListener("pointerdown", kick);
    window.addEventListener("keydown", kick);
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg select-none">
      <Canvas
        className="absolute inset-0 touch-none"
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [0.35, 1.85, 4.85], fov: 38, near: 0.1, far: 42 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0c0b0a");
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <PianoWorld />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 stage-vignette" />
      <Overlays />
    </div>
  );
}