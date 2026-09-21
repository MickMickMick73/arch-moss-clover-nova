import {
  ChevronLeft,
  GraduationCap,
  Headphones,
  HelpCircle,
  Keyboard,
  Music,
  Pause,
  Play,
  Settings,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  noteName,
  LAYOUT,
  MIDI_MIN,
  MIDI_MAX,
  LEFT_BLACK,
  LEFT_WHITE,
  RIGHT_BLACK,
  RIGHT_WHITE,
  codeCaption,
  type KeyCap,
} from "./keys";
import { SONGS, songDurationSec } from "./songs";
import { currentSong, starsFor, useGame, type Mode } from "./store";

function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "soft";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium tracking-wide transition-[opacity,transform,background-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] enabled:active:scale-[0.98] disabled:opacity-40",
        variant === "primary" && "bg-accent text-accent-fg hover:opacity-90",
        variant === "secondary" && "border border-line bg-surface-2 text-fg hover:bg-surface",
        variant === "ghost" && "text-fg hover:bg-surface-2",
        variant === "soft" && "bg-fg/10 text-fg hover:bg-fg/16",
        className,
      )}
      {...props}
    />
  );
}

export function Overlays() {
  const screen = useGame((s) => s.screen);
  const settingsOpen = useGame((s) => s.settingsOpen);
  const paused = useGame((s) => s.paused);
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {screen === "title" && <Title />}
      {screen === "songs" && <SongSelect />}
      {screen === "howto" && <Howto />}
      {screen === "play" && <HUD />}
      {screen === "play" && paused && <PauseSheet />}
      {screen === "results" && <Results />}
      {settingsOpen && <SettingsSheet />}
    </div>
  );
}

function Title() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 py-6 sm:px-10 sm:py-10">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted">Concert for one</p>
        <TopIcons />
      </div>
      <div className="pointer-events-auto max-w-xl panel-enter">
        <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.95] tracking-[-0.03em] text-fg">
          Ivory Hopper
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
          A tiny maestro on a giant concert piano. Hop the glowing keys in order — Chopsticks, Twinkle, Für Elise — or sit back and listen to each piece in time.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => useGame.getState().goSongs()}>
            <Play className="size-4" />
            Play songs
          </Button>
          <Button variant="secondary" onClick={() => useGame.getState().startFree()}>
            Free play
          </Button>
          <Button variant="ghost" onClick={() => useGame.getState().goHowto()}>
            <HelpCircle className="size-4" />
            How to play
          </Button>
        </div>
      </div>
    </div>
  );
}

function TopIcons() {
  const muted = useGame((s) => s.muted);
  return (
    <div className="pointer-events-auto flex items-center gap-1">
      <Button
        variant="ghost"
        className="min-h-11 min-w-11 px-0"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => useGame.getState().setMuted(!muted)}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </Button>
      <Button
        variant="ghost"
        className="min-h-11 min-w-11 px-0"
        aria-label="Settings"
        onClick={() => useGame.getState().toggleSettings(true)}
      >
        <Settings className="size-4" />
      </Button>
    </div>
  );
}

function SongSelect() {
  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col bg-bg/55 px-4 py-5 backdrop-blur-[2px] sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <Button variant="ghost" className="px-3" onClick={() => useGame.getState().goTitle()}>
          <ChevronLeft className="size-4" />
          Hall
        </Button>
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">The programme</h2>
        <TopIcons />
      </div>
      <p className="mx-auto mt-2 max-w-5xl text-sm text-muted">
        Learn lights the path. Recital scores your accuracy. Listen plays each piece in time — sit back and watch.
      </p>
      <div className="mx-auto mt-5 grid w-full max-w-5xl flex-1 grid-cols-1 gap-3 overflow-y-auto pb-6 sm:grid-cols-2 lg:grid-cols-3">
        {SONGS.map((song) => (
          <article
            key={song.id}
            className="flex flex-col rounded-2xl border border-line bg-surface/90 p-4 shadow-panel"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl leading-tight text-fg">{song.title}</h3>
                <p className="text-xs text-muted">{song.composer}</p>
              </div>
              <Difficulty n={song.difficulty} />
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{song.blurb}</p>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-subtle">
              <span>
                {song.notes.length} hops · {Math.round(songDurationSec(song))}s · {song.bpm} BPM
              </span>
              <span className="flex items-center gap-3">
                <Stars n={starsFor(song.id, "learn")} label="Learn" />
                <Stars n={starsFor(song.id, "recital")} label="Recital" />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="flex-1" onClick={() => useGame.getState().startSong(song.id, "learn")}>
                <GraduationCap className="size-4" />
                Learn
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => useGame.getState().startSong(song.id, "recital")}
              >
                <Trophy className="size-4" />
                Recital
              </Button>
            </div>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => useGame.getState().startSong(song.id, "demo")}
            >
              <Headphones className="size-4" />
              Listen in time
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

function Difficulty({ n }: { n: number }) {
  return (
    <div className="flex gap-1 pt-1" aria-label={`Difficulty ${n} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn("h-1.5 w-3 rounded-full", i < n ? "bg-accent" : "bg-line")}
        />
      ))}
    </div>
  );
}

function Stars({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={label}>
      {Array.from({ length: 3 }, (_, i) => (
        <Star
          key={i}
          className={cn("size-3", i < n ? "fill-accent text-accent" : "text-subtle")}
        />
      ))}
    </span>
  );
}

function HUD() {
  const mode = useGame((s) => s.mode);
  const noteIndex = useGame((s) => s.noteIndex);
  const combo = useGame((s) => s.combo);
  const score = useGame((s) => s.score);
  const lastJudge = useGame((s) => s.lastJudge);
  const song = currentSong();
  const total = song?.notes.length ?? 0;

  return (
    <>
      <div className="pointer-events-auto absolute top-0 right-0 left-0 flex items-start justify-between gap-3 px-3 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="soft" className="px-3" aria-label="Programme" onClick={() => useGame.getState().goSongs()}>
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Programme</span>
          </Button>
          <div className="rounded-2xl bg-bg/55 px-3 py-2 backdrop-blur-sm">
            <p className="font-display text-lg leading-none text-fg">{song?.title ?? "Free play"}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
              {modeLabel(mode)}
              {mode === "demo" && song ? ` · ${song.bpm} BPM` : ""}
              {total > 0 ? ` · ${Math.min(noteIndex, total)}/${total}` : ""}
            </p>
            {total > 0 && (
              <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-line sm:w-36">
                <div
                  className="h-full bg-accent transition-[width] duration-150"
                  style={{ width: `${(Math.min(noteIndex, total) / total) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode !== "free" && mode !== "demo" && (
            <div className="hidden rounded-2xl bg-bg/55 px-3 py-2 text-right backdrop-blur-sm sm:block">
              <p className="font-mono text-sm tabular-nums text-fg">{score}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                {combo > 1 ? `${combo} combo` : "score"}
              </p>
            </div>
          )}
          {mode !== "free" && (
            <Button
              variant="soft"
              className="min-h-11 min-w-11 px-0"
              aria-label="Pause"
              onClick={() => useGame.getState().pause(true)}
            >
              <Pause className="size-4" />
            </Button>
          )}
          <TopIcons />
        </div>
      </div>

      {song && mode !== "free" && (
        <div className="pointer-events-none absolute top-24 right-0 left-0 hidden justify-center px-3 sm:flex">
          <div className="flex max-w-full items-center gap-1 overflow-hidden rounded-full bg-bg/50 px-2 py-1.5 backdrop-blur-sm">
            {song.notes.slice(noteIndex, noteIndex + 8).map((n, i) => (
              <span
                key={`${n.midi}-${noteIndex + i}`}
                className={cn(
                  "rounded-full px-2 py-0.5 font-display text-sm",
                  i === 0 ? "note-now bg-accent text-accent-fg" : "text-muted",
                )}
              >
                {noteName(n.midi).replace("#", "♯")}
              </span>
            ))}
          </div>
        </div>
      )}

      {mode !== "demo" && <JudgePop judge={lastJudge} />}

      {mode === "demo" && (
        <p className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-xs tracking-wide text-muted sm:block">
          Count-in, then hops land on the beat
        </p>
      )}
      {mode !== "demo" && <MiniPiano />}
      {mode !== "demo" && <TouchControls />}
      {mode !== "demo" && <DesktopHint />}
      {mode !== "demo" && <KeyboardGuide />}
    </>
  );
}

function modeLabel(mode: Mode) {
  if (mode === "learn") return "Learn";
  if (mode === "recital") return "Recital";
  if (mode === "demo") return "Listening";
  return "Free play";
}

function JudgePop({ judge }: { judge: string | null }) {
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (!judge) return;
    setShown(judge);
    const t = window.setTimeout(() => setShown(null), 520);
    return () => window.clearTimeout(t);
  }, [judge]);
  if (!shown) return null;
  const label =
    shown === "perfect"
      ? "Perfect"
      : shown === "good"
        ? "Good"
        : shown === "ok"
          ? "Ok"
          : shown === "miss"
            ? "Try the glow"
            : shown === "hit"
              ? "Yes"
              : "";
  if (!label) return null;
  return (
    <div className="judge-pop pointer-events-none absolute top-1/3 left-1/2 font-display text-3xl text-accent">
      {label}
    </div>
  );
}

function DesktopHint() {
  const mode = useGame((s) => s.mode);
  const showKeyboard = useGame((s) => s.showKeyboard);
  if (showKeyboard !== false) return null;
  return (
    <p className="pointer-events-none absolute bottom-36 left-1/2 hidden -translate-x-1/2 text-xs tracking-wide text-muted sm:block">
      {mode === "learn"
        ? "Space hops to the glow · arrows step · two hands on the keys"
        : "Arrows hop · left ZXCVBNM · right QWERTYUIOP · both hands at once"}
    </p>
  );
}

function KeyboardGuide() {
  const show = useGame((s) => s.showKeyboard !== false && s.screen === "play" && !s.paused);
  const noteIndex = useGame((s) => s.noteIndex);
  const song = currentSong();
  const next = song?.notes[noteIndex]?.midi;
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute bottom-5 left-1/2 hidden w-[min(44rem,calc(100%-1.5rem))] -translate-x-1/2 sm:block">
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-bg/70 px-3 py-2 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between">
        <HandCluster label="Left · C3–C4" blacks={LEFT_BLACK} whites={LEFT_WHITE} next={next} />
        <HandCluster label="Right · C4–G5" blacks={RIGHT_BLACK} whites={RIGHT_WHITE} next={next} />
      </div>
    </div>
  );
}

function HandCluster({
  label,
  blacks,
  whites,
  next,
}: {
  label: string;
  blacks: KeyCap[];
  whites: KeyCap[];
  next: number | undefined;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</p>
      <div className="relative mb-0.5 flex h-5 items-end pl-3">
        {blacks.map((k) => (
          <span
            key={k.code}
            className={cn(
              "mr-0.5 flex h-5 w-5 items-center justify-center rounded-sm text-[9px] font-medium",
              k.gap && "ml-3",
              k.midi === next ? "bg-glow text-fg ring-1 ring-accent" : "bg-bg text-muted",
            )}
          >
            {codeCaption(k.code)}
          </span>
        ))}
      </div>
      <div className="flex">
        {whites.map((k) => (
          <span
            key={k.code}
            className={cn(
              "mr-0.5 flex h-6 min-w-6 flex-1 items-center justify-center rounded-sm text-[10px] font-medium",
              k.midi === next ? "bg-accent text-accent-fg" : "bg-fg/90 text-subtle",
            )}
          >
            {codeCaption(k.code)}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniPiano() {
  const mode = useGame((s) => s.mode);
  const noteIndex = useGame((s) => s.noteIndex);
  const showKeyboard = useGame((s) => s.showKeyboard !== false);
  const song = currentSong();
  const next = song?.notes[noteIndex]?.midi;
  const n1 = song?.notes[noteIndex + 1]?.midi;
  const n2 = song?.notes[noteIndex + 2]?.midi;

  const range = (() => {
    if (!song) return { lo: 60, hi: 72 };
    const midis = song.notes.map((n) => n.midi);
    const min = Math.min(...midis);
    const max = Math.max(...midis);
    const lo = Math.max(MIDI_MIN, min - 2);
    const hi = Math.min(MIDI_MAX, max + 2);
    return { lo, hi };
  })();

  const keys = LAYOUT.filter((k) => k.midi >= range.lo && k.midi <= range.hi);
  const whites = keys.filter((k) => !k.isBlack);

  return (
    <div
      className={cn(
        "pointer-events-auto absolute right-0 bottom-16 left-0 flex items-end justify-center gap-2 px-3 sm:bottom-5",
        showKeyboard && "sm:hidden",
      )}
    >
      <div className="relative flex h-16 max-w-xl flex-1 overflow-hidden rounded-2xl border border-line bg-surface/90 px-1 pt-2 shadow-panel sm:h-20 sm:flex-none sm:w-full">
        {whites.map((key) => {
          const glow = key.midi === next;
          const later = key.midi === n1 || key.midi === n2;
          return (
            <button
              key={key.midi}
              type="button"
              aria-label={key.name}
              onPointerDown={(e) => {
                e.preventDefault();
                useGame.getState().hopTo(key.midi);
              }}
              className={cn(
                "relative flex h-full min-w-6 flex-1 flex-col items-center justify-end rounded-sm border border-line pb-1 text-xs sm:min-w-7",
                glow
                  ? "bg-glow text-fg ring-2 ring-accent"
                  : later
                    ? "bg-glow/35 text-fg"
                    : "bg-fg text-subtle",
              )}
            >
              {key.short}
            </button>
          );
        })}
        {keys
          .filter((k) => k.isBlack)
          .map((key) => {
            const whitesBefore = whites.filter((w) => w.x < key.x).length;
            const glow = key.midi === next;
            const pct = whites.length <= 1 ? 0 : (whitesBefore / whites.length) * 100;
            return (
              <button
                key={key.midi}
                type="button"
                aria-label={key.name}
                onPointerDown={(e) => {
                  e.preventDefault();
                  useGame.getState().hopTo(key.midi);
                }}
                style={{ left: `calc(${pct}% - 0.45rem)` }}
                className={cn("absolute top-2 h-8 w-4 rounded-sm sm:h-10", glow ? "bg-glow" : "bg-bg")}
              />
            );
          })}
      </div>
      {mode === "learn" && (
        <Button className="mb-1 hidden shrink-0 px-4 sm:inline-flex" onPointerDown={() => hopTarget()}>
          Hop to glow
        </Button>
      )}
    </div>
  );
}

function TouchControls() {
  const mode = useGame((s) => s.mode);
  return (
    <div className="pointer-events-auto absolute right-0 bottom-0 left-0 flex items-end justify-between gap-3 px-4 py-4 sm:hidden">
      <div className="flex gap-2">
        <Button variant="secondary" className="min-h-12 min-w-12 px-0" aria-label="Hop left" onPointerDown={() => hopDir(-1)}>
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          variant="secondary"
          className="min-h-12 min-w-12 px-0"
          aria-label="Hop right"
          onPointerDown={() => hopDir(1)}
        >
          <ChevronLeft className="size-5 rotate-180" />
        </Button>
      </div>
      {(mode === "learn" || mode === "free") && (
        <Button className="min-h-12 px-6" onPointerDown={() => hopTarget()}>
          {mode === "learn" ? "Hop to glow" : "Bounce"}
        </Button>
      )}
    </div>
  );
}

function hopDir(dir: -1 | 1) {
  const code = dir < 0 ? "ArrowLeft" : "ArrowRight";
  const ev = new KeyboardEvent("keydown", { code, bubbles: true });
  window.dispatchEvent(ev);
  window.setTimeout(() => {
    window.dispatchEvent(new KeyboardEvent("keyup", { code, bubbles: true }));
  }, 80);
}

function hopTarget() {
  const st = useGame.getState();
  const song = currentSong();
  const next = song?.notes[st.noteIndex];
  if (next) {
    st.hopTo(next.midi);
    return;
  }
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true }));
  window.setTimeout(() => {
    window.dispatchEvent(new KeyboardEvent("keyup", { code: "Space", bubbles: true }));
  }, 80);
}

function PauseSheet() {
  const mode = useGame((s) => s.mode);
  const song = currentSong();
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-bg/60 px-4">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Paused</p>
        <h2 className="mt-1 font-display text-4xl">{song?.title ?? "Free play"}</h2>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => useGame.getState().pause(false)}>Resume</Button>
          {mode !== "free" && song && (
            <Button variant="secondary" onClick={() => useGame.getState().startSong(song.id, mode)}>
              Restart
            </Button>
          )}
          {mode !== "demo" && mode !== "free" && song && (
            <Button variant="ghost" onClick={() => useGame.getState().startSong(song.id, "demo")}>
              <Headphones className="size-4" />
              Listen in time
            </Button>
          )}
          <Button variant="ghost" onClick={() => useGame.getState().goSongs()}>
            Programme
          </Button>
        </div>
      </div>
    </div>
  );
}

function Results() {
  const song = currentSong();
  const hits = useGame((s) => s.hits);
  const misses = useGame((s) => s.misses);
  const combo = useGame((s) => s.maxCombo);
  const score = useGame((s) => s.score);
  const mode = useGame((s) => s.mode);
  const total = song?.notes.length ?? 0;
  const earned = song && (mode === "learn" || mode === "recital") ? starsFor(song.id, mode) : 0;

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-bg/40 px-4 py-8 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Curtain</p>
        <h2 className="mt-1 font-display text-4xl leading-tight">{song?.title ?? "Free play"}</h2>
        {mode !== "demo" && mode !== "free" && (
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Star key={i} className={cn("size-7", i < earned ? "fill-accent text-accent" : "text-subtle")} />
            ))}
          </div>
        )}
        {mode === "demo" && song ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Played in time at {song.bpm} BPM — hops landed on the beat, notes held their true length.
          </p>
        ) : (
          <>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
              <Stat label="Score" value={String(score)} />
              <Stat label="Hits" value={`${hits}/${total}`} />
              <Stat label="Combo" value={String(combo)} />
            </dl>
            {misses > 0 && <p className="mt-3 text-center text-sm text-muted">{misses} missed hops</p>}
          </>
        )}
        <div className="mt-6 flex flex-col gap-2">
          {song && mode !== "free" && (
            <Button onClick={() => useGame.getState().startSong(song.id, mode === "demo" ? "learn" : mode)}>
              {mode === "demo" ? "Your turn" : "Play again"}
            </Button>
          )}
          {song && mode === "demo" && (
            <Button variant="secondary" onClick={() => useGame.getState().startSong(song.id, "demo")}>
              Listen again
            </Button>
          )}
          {song && mode === "learn" && (
            <Button variant="secondary" onClick={() => useGame.getState().startSong(song.id, "recital")}>
              Recital
            </Button>
          )}
          {song && mode !== "demo" && mode !== "free" && (
            <Button variant="ghost" onClick={() => useGame.getState().startSong(song.id, "demo")}>
              <Headphones className="size-4" />
              Listen in time
            </Button>
          )}
          <Button variant="ghost" onClick={() => useGame.getState().goSongs()}>
            Programme
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-2 py-3">
      <div className="font-mono text-lg tabular-nums text-fg">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</div>
    </div>
  );
}

function Howto() {
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-bg/50 px-4 py-6 sm:items-center">
      <div className="max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">The hall</p>
        <h2 className="mt-1 font-display text-4xl">How to hop</h2>
        <ol className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-fg">Tap a key</span> — or hop with the arrows — and the piano speaks. The little maestro lands, the note rings.
          </li>
          <li>
            <span className="font-medium text-fg">Listen</span> plays two count-in ticks, then the piece at its written tempo. Notes ring for their true length. Sit back, then take your turn.
          </li>
          <li>
            <span className="font-medium text-fg">Learn</span> lights the next keys in teal. Space — or Hop to glow — jumps the highlighted note. Wrong keys still play; the glow waits.
          </li>
          <li>
            <span className="font-medium text-fg">Recital</span> scores accuracy and timing. Land the sequence. Stars wait at the curtain.
          </li>
          <li>
            <span className="font-medium text-fg">Two hands</span> — left hand ZXCVBNM (C3–C4) and right QWERTYUIOP (C4–G5), including the black-key numbers. Play both at once for Chopsticks and Heart and Soul. Arrows still hop.
          </li>
        </ol>
        <KeyboardLegend />
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => useGame.getState().goSongs()}>
            <Music className="size-4" />
            Choose a song
          </Button>
          <Button variant="ghost" onClick={() => useGame.getState().goTitle()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

function KeyboardLegend() {
  return (
    <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-3">
      <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Keyboard className="size-3.5" />
        Two-hand keyboard
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <HandCluster label="Left · C3–C4" blacks={LEFT_BLACK} whites={LEFT_WHITE} next={undefined} />
        <HandCluster label="Right · C4–G5" blacks={RIGHT_BLACK} whites={RIGHT_WHITE} next={undefined} />
      </div>
    </div>
  );
}

function SettingsSheet() {
  const master = useGame((s) => s.master);
  const muted = useGame((s) => s.muted);
  const shake = useGame((s) => s.shake);
  const showNames = useGame((s) => s.showNames);
  const showKeyboard = useGame((s) => s.showKeyboard);
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-end justify-center bg-bg/55 px-4 py-6 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Settings</h2>
          <Button variant="ghost" className="px-3" onClick={() => useGame.getState().toggleSettings(false)}>
            Close
          </Button>
        </div>
        <label className="mt-5 block text-sm text-muted">
          Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={master}
            onChange={(e) => useGame.getState().setMaster(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </label>
        <Toggle label="Mute" on={muted} onChange={(v) => useGame.getState().setMuted(v)} />
        <Toggle label="Camera shake" on={shake} onChange={(v) => useGame.getState().setShake(v)} />
        <Toggle label="Note names on keys" on={showNames} onChange={(v) => useGame.getState().setShowNames(v)} />
        <Toggle label="Keyboard guide" on={showKeyboard !== false} onChange={(v) => useGame.getState().setShowKeyboard(v)} />
      </div>
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="mt-3 flex min-h-11 w-full items-center justify-between rounded-2xl bg-surface-2 px-4 text-sm"
    >
      <span>{label}</span>
      <span className={cn("h-6 w-10 rounded-full p-0.5 transition-colors", on ? "bg-accent" : "bg-line")}>
        <span className={cn("block h-5 w-5 rounded-full bg-accent-fg transition-transform", on && "translate-x-4")} />
      </span>
    </button>
  );
}

