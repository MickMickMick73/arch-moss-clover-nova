import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SONG_BY_ID, type Song } from "./songs";
import { piano } from "./audio";

export type Mode = "learn" | "recital" | "free" | "demo";
export type Screen = "title" | "songs" | "play" | "results" | "howto";
export type Judge = "perfect" | "good" | "ok" | "hit" | "miss";

type Persisted = {
  stars: Record<string, number>;
  master: number;
  muted: boolean;
  shake: boolean;
  showNames: boolean;
  showKeyboard: boolean;
};

type Runtime = {
  screen: Screen;
  mode: Mode;
  songId: string | null;
  playId: number;
  noteIndex: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  perfects: number;
  score: number;
  lastJudge: Judge | null;
  paused: boolean;
  finished: boolean;
  settingsOpen: boolean;
  camWide: boolean;
  pendingMidi: number | null;
};

type Actions = {
  unlock: () => void;
  goTitle: () => void;
  goSongs: () => void;
  goHowto: () => void;
  startSong: (id: string, mode: Mode) => void;
  startFree: () => void;
  pause: (v: boolean) => void;
  hopTo: (midi: number) => void;
  consumeHop: () => number | null;
  registerHit: (judge: Judge) => void;
  registerMiss: () => void;
  finish: () => void;
  setMaster: (v: number) => void;
  setMuted: (v: boolean) => void;
  setShake: (v: boolean) => void;
  setShowNames: (v: boolean) => void;
  setShowKeyboard: (v: boolean) => void;
  toggleSettings: (v?: boolean) => void;
};

export type GameState = Persisted & Runtime & Actions;

const initialRuntime: Runtime = {
  screen: "title",
  mode: "free",
  songId: null,
  playId: 0,
  noteIndex: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  misses: 0,
  perfects: 0,
  score: 0,
  lastJudge: null,
  paused: false,
  finished: false,
  settingsOpen: false,
  camWide: true,
  pendingMidi: null,
};

function starScore(hits: number, misses: number, perfects: number, total: number) {
  if (total <= 0) return 0;
  const accuracy = hits / total;
  const perfectRate = perfects / total;
  if (accuracy >= 0.96 && perfectRate >= 0.45) return 3;
  if (accuracy >= 0.8) return 3;
  if (accuracy >= 0.6) return 2;
  if (hits > 0) return 1;
  return 0;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      stars: {},
      master: 0.72,
      muted: false,
      shake: true,
      showNames: true,
      showKeyboard: true,
      ...initialRuntime,
      unlock: () => {
        piano.unlock();
        piano.setMuted(get().muted);
        piano.setVolume(get().master);
      },
      goTitle: () => set({ screen: "title", camWide: true, paused: false, settingsOpen: false }),
      goSongs: () => set({ screen: "songs", camWide: true, paused: false, settingsOpen: false }),
      goHowto: () => set({ screen: "howto", camWide: true, settingsOpen: false }),
      startSong: (id, mode) => {
        const song = SONG_BY_ID.get(id);
        if (!song) return;
        get().unlock();
        piano.uiTick();
        set({
          screen: "play",
          mode,
          songId: id,
          playId: get().playId + 1,
          noteIndex: 0,
          combo: 0,
          maxCombo: 0,
          hits: 0,
          misses: 0,
          perfects: 0,
          score: 0,
          lastJudge: null,
          paused: false,
          finished: false,
          camWide: false,
          settingsOpen: false,
          pendingMidi: null,
        });
      },
      startFree: () => {
        get().unlock();
        set({
          screen: "play",
          mode: "free",
          songId: null,
          playId: get().playId + 1,
          noteIndex: 0,
          combo: 0,
          maxCombo: 0,
          hits: 0,
          misses: 0,
          perfects: 0,
          score: 0,
          lastJudge: null,
          paused: false,
          finished: false,
          camWide: false,
          settingsOpen: false,
          pendingMidi: null,
        });
      },
      pause: (v) => set({ paused: v }),
      hopTo: (midi) => set({ pendingMidi: midi }),
      consumeHop: () => {
        const midi = get().pendingMidi;
        if (midi == null) return null;
        set({ pendingMidi: null });
        return midi;
      },
      registerHit: (judge) => {
        const s = get();
        const combo = s.combo + 1;
        const add = (judge === "perfect" ? 300 : judge === "good" ? 200 : 120) * (1 + Math.min(combo, 20) * 0.05);
        set({
          hits: s.hits + 1,
          combo,
          maxCombo: Math.max(s.maxCombo, combo),
          perfects: s.perfects + (judge === "perfect" ? 1 : 0),
          score: s.score + Math.round(add),
          lastJudge: judge,
          noteIndex: s.noteIndex + 1,
        });
      },
      registerMiss: () => {
        const s = get();
        set({ misses: s.misses + 1, combo: 0, lastJudge: "miss" });
      },
      finish: () => {
        const s = get();
        if (s.finished) return;
        const song = s.songId ? SONG_BY_ID.get(s.songId) : undefined;
        const total = song?.notes.length ?? 0;
        const stars = s.mode === "free" || s.mode === "demo" ? 0 : starScore(s.hits, s.misses, s.perfects, total);
        const key = s.songId && (s.mode === "learn" || s.mode === "recital") ? `${s.songId}:${s.mode}` : null;
        const nextStars = { ...s.stars };
        if (key) nextStars[key] = Math.max(nextStars[key] ?? 0, stars);
        piano.arpeggio([60, 64, 67, 72]);
        set({ finished: true, screen: "results", camWide: true, stars: nextStars, paused: false });
      },
      setMaster: (v) => {
        piano.setVolume(v);
        set({ master: v });
      },
      setMuted: (v) => {
        piano.setMuted(v);
        set({ muted: v });
      },
      setShake: (v) => set({ shake: v }),
      setShowNames: (v) => set({ showNames: v }),
      setShowKeyboard: (v) => set({ showKeyboard: v }),
      toggleSettings: (v) => set({ settingsOpen: v ?? !get().settingsOpen }),
    }),
    {
      name: "ivory-hopper-v1",
      version: 1,
      partialize: (s) => ({
        stars: s.stars,
        master: s.master,
        muted: s.muted,
        shake: s.shake,
        showNames: s.showNames,
        showKeyboard: s.showKeyboard,
      }),
    },
  ),
);

export function currentSong(): Song | undefined {
  const id = useGame.getState().songId;
  return id ? SONG_BY_ID.get(id) : undefined;
}

export function starsFor(id: string, mode: "learn" | "recital") {
  return useGame.getState().stars[`${id}:${mode}`] ?? 0;
}
