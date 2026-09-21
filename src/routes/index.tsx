import { createFileRoute } from "@tanstack/react-router";
import { GameBoot } from "@/game/GameBoot";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <GameBoot />;
}
