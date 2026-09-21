import { lazy, Suspense, useEffect, useState } from "react";

const GameApp = lazy(() => import("./GameApp"));

export function GameBoot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <BootScreen />;
  return (
    <Suspense fallback={<BootScreen />}>
      <GameApp />
    </Suspense>
  );
}

function BootScreen() {
  return (
    <div className="relative flex h-dvh w-full items-end overflow-hidden bg-bg">
      <img src="/game/hall.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-bg/55" />
      <div className="relative z-10 px-8 py-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted">Concert for one</p>
        <h1 className="mt-2 font-display text-5xl tracking-tight text-fg sm:text-6xl">Ivory Hopper</h1>
      </div>
    </div>
  );
}