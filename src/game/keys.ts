export const MIDI_MIN = 48; // C3
export const MIDI_MAX = 84; // C6
export const WHITE_W = 0.228;
export const WHITE_L = 1.48;
export const WHITE_H = 0.11;
export const BLACK_W = 0.138;
export const BLACK_L = 0.92;
export const BLACK_H = 0.18;
export const KEY_GAP = 0.012;

const PC_BLACK = new Set([1, 3, 6, 8, 10]);
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function isBlackKey(midi: number) {
  return PC_BLACK.has(midi % 12);
}

export function noteName(midi: number) {
  const n = NOTE_NAMES[((midi % 12) + 12) % 12] ?? "C";
  const oct = Math.floor(midi / 12) - 1;
  return `${n}${oct}`;
}

export function parseNote(token: string): number {
  const m = token.match(/^([A-G])([#b]?)(\d)$/);
  if (!m) throw new Error(`Bad note: ${token}`);
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let pc = base[m[1] ?? "C"] ?? 0;
  if (m[2] === "#") pc += 1;
  if (m[2] === "b") pc -= 1;
  const oct = Number(m[3]);
  return (oct + 1) * 12 + pc;
}

export type KeyLayout = {
  midi: number;
  x: number;
  isBlack: boolean;
  name: string;
  short: string;
};

export function buildLayout(): KeyLayout[] {
  const keys: KeyLayout[] = [];
  let whiteI = 0;
  for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
    const black = isBlackKey(midi);
    const short = (NOTE_NAMES[midi % 12] ?? "C").replace("#", "♯");
    if (!black) {
      keys.push({
        midi,
        x: whiteI * WHITE_W,
        isBlack: false,
        name: noteName(midi),
        short,
      });
      whiteI += 1;
    } else {
      keys.push({
        midi,
        x: (whiteI - 0.5) * WHITE_W,
        isBlack: true,
        name: noteName(midi),
        short,
      });
    }
  }
  const lastWhite = (whiteI - 1) * WHITE_W;
  const mid = lastWhite / 2;
  for (const key of keys) key.x -= mid;
  return keys;
}

export const LAYOUT = buildLayout();
export const LAYOUT_BY_MIDI = new Map(LAYOUT.map((k) => [k.midi, k]));

const whites = LAYOUT.filter((k) => !k.isBlack);
export const WHITE_KEYS = whites;
export const KEYBOARD_WIDTH = whites.length * WHITE_W;
export const CASE_WIDTH = KEYBOARD_WIDTH + 0.55;

/** Two-hand QWERTY piano. Left = bass C3–C4, right = treble C4–G5. Arrows hop. */
export const PC_TO_MIDI: Record<string, number> = {
  KeyZ: 48,
  KeyS: 49,
  KeyX: 50,
  KeyD: 51,
  KeyC: 52,
  KeyV: 53,
  KeyG: 54,
  KeyB: 55,
  KeyH: 56,
  KeyN: 57,
  KeyJ: 58,
  KeyM: 59,
  Comma: 60,
  KeyQ: 60,
  Digit2: 61,
  KeyW: 62,
  Digit3: 63,
  KeyE: 64,
  KeyR: 65,
  Digit5: 66,
  KeyT: 67,
  Digit6: 68,
  KeyY: 69,
  Digit7: 70,
  KeyU: 71,
  KeyI: 72,
  Digit9: 73,
  KeyO: 74,
  Digit0: 75,
  KeyP: 76,
  BracketLeft: 77,
  Minus: 78,
  BracketRight: 79,
  Equal: 80,
  Backslash: 81,
};

export const MIDI_TO_PC: Record<number, string> = Object.fromEntries(
  Object.entries(PC_TO_MIDI).map(([code, midi]) => [midi, code]),
);

export function codesForMidi(midi: number): string[] {
  return Object.entries(PC_TO_MIDI)
    .filter(([, m]) => m === midi)
    .map(([code]) => code);
}

export function codeCaption(code: string) {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code === "BracketLeft") return "[";
  if (code === "BracketRight") return "]";
  if (code === "Minus") return "-";
  if (code === "Equal") return "=";
  if (code === "Backslash") return "\\";
  if (code === "Comma") return ",";
  if (code === "Period") return ".";
  if (code === "Slash") return "/";
  return code;
}

export type KeyCap = { code: string; midi: number; gap?: boolean };

export const LEFT_BLACK: KeyCap[] = [
  { code: "KeyS", midi: 49 },
  { code: "KeyD", midi: 51 },
  { code: "KeyG", midi: 54, gap: true },
  { code: "KeyH", midi: 56 },
  { code: "KeyJ", midi: 58 },
];

export const LEFT_WHITE: KeyCap[] = [
  { code: "KeyZ", midi: 48 },
  { code: "KeyX", midi: 50 },
  { code: "KeyC", midi: 52 },
  { code: "KeyV", midi: 53 },
  { code: "KeyB", midi: 55 },
  { code: "KeyN", midi: 57 },
  { code: "KeyM", midi: 59 },
  { code: "Comma", midi: 60 },
];

export const RIGHT_BLACK: KeyCap[] = [
  { code: "Digit2", midi: 61 },
  { code: "Digit3", midi: 63 },
  { code: "Digit5", midi: 66, gap: true },
  { code: "Digit6", midi: 68 },
  { code: "Digit7", midi: 70 },
  { code: "Digit9", midi: 73, gap: true },
  { code: "Digit0", midi: 75 },
  { code: "Minus", midi: 78, gap: true },
  { code: "Equal", midi: 80 },
];

export const RIGHT_WHITE: KeyCap[] = [
  { code: "KeyQ", midi: 60 },
  { code: "KeyW", midi: 62 },
  { code: "KeyE", midi: 64 },
  { code: "KeyR", midi: 65 },
  { code: "KeyT", midi: 67 },
  { code: "KeyY", midi: 69 },
  { code: "KeyU", midi: 71 },
  { code: "KeyI", midi: 72 },
  { code: "KeyO", midi: 74 },
  { code: "KeyP", midi: 76 },
  { code: "BracketLeft", midi: 77 },
  { code: "BracketRight", midi: 79 },
];


export function whiteKeyCut(midi: number) {
  const cut = BLACK_W * 0.52;
  const left = isBlackKey(midi - 1) && midi - 1 >= MIDI_MIN ? cut : 0;
  const right = isBlackKey(midi + 1) && midi + 1 <= MIDI_MAX ? cut : 0;
  return { left, right };
}

export function getKey(midi: number): KeyLayout {
  return LAYOUT_BY_MIDI.get(midi) ?? LAYOUT[Math.floor(LAYOUT.length / 2)]!;
}

export function standPos(midi: number) {
  const key = getKey(midi);
  const y = key.isBlack ? WHITE_H + BLACK_H : WHITE_H;
  const z = key.isBlack ? BLACK_L * 0.46 : WHITE_L * 0.62;
  return { x: key.x, y, z };
}

export function nextWhite(midi: number, dir: -1 | 1): KeyLayout | null {
  const cur = getKey(midi);
  if (cur.isBlack) {
    const candidates = whites.filter((w) => (dir < 0 ? w.x < cur.x : w.x > cur.x));
    if (candidates.length === 0) return null;
    return dir < 0 ? (candidates[candidates.length - 1] ?? null) : (candidates[0] ?? null);
  }
  const idx = whites.findIndex((w) => w.midi === midi);
  return whites[idx + dir] ?? null;
}

export function stereoPan(x: number) {
  const half = KEYBOARD_WIDTH / 2;
  return Math.max(-0.85, Math.min(0.85, half === 0 ? 0 : x / half));
}
