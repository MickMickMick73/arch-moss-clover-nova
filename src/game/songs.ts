import { parseNote } from "./keys";

export type SongNote = { midi: number; beats: number };

export type Song = {
  id: string;
  title: string;
  composer: string;
  blurb: string;
  bpm: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  notes: SongNote[];
};

/** Two quiet beats before the first note in Listen, so hops can land on time. */
export const LISTEN_COUNT_IN_BEATS = 2;

function score(src: string, defaultBeats = 1): SongNote[] {
  return src
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [name, beats] = tok.split(":");
      if (!name) throw new Error(`Empty note in: ${src}`);
      return { midi: parseNote(name), beats: beats ? Number(beats) : defaultBeats };
    });
}

export const SONGS: Song[] = [
  {
    id: "chopsticks",
    title: "Chopsticks",
    composer: "Euphemia Allen",
    blurb: "The hopping classic. Two keys, one tiny maestro.",
    bpm: 96,
    difficulty: 2,
    notes: score(
      `F5:0.5 G5:0.5 F5:0.5 G5:0.5 F5:0.5 G5:0.5 F5:0.5 G5:0.5
       E5:0.5 G5:0.5 E5:0.5 G5:0.5 E5:0.5 G5:0.5 E5:0.5 G5:0.5
       D5:0.5 F5:0.5 D5:0.5 F5:0.5 D5:0.5 F5:0.5 D5:0.5 F5:0.5
       C5:0.5 E5:0.5 C5:0.5 E5:0.5 C5:0.5 E5:0.5 C5:0.5 E5:0.5
       C5 E5 G5 C6:2 G5 E5 C5:2`,
    ),
  },
  {
    id: "hot-cross-buns",
    title: "Hot Cross Buns",
    composer: "Traditional",
    blurb: "Three notes. The first hop of every pianist.",
    bpm: 88,
    difficulty: 1,
    notes: score(`E4 D4 C4:2 E4 D4 C4:2 C4:0.5 C4:0.5 C4:0.5 C4:0.5 D4:0.5 D4:0.5 D4:0.5 D4:0.5 E4 D4 C4:2`),
  },
  {
    id: "twinkle",
    title: "Twinkle Twinkle Little Star",
    composer: "Traditional",
    blurb: "Look up. Then look down. Then hop.",
    bpm: 92,
    difficulty: 2,
    notes: score(
      `C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2
       G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2
       C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2`,
    ),
  },
  {
    id: "mary",
    title: "Mary Had a Little Lamb",
    composer: "Traditional",
    blurb: "A gentle walk down the white keys.",
    bpm: 96,
    difficulty: 1,
    notes: score(
      `E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:2`,
    ),
  },
  {
    id: "scale",
    title: "C Major Scale",
    composer: "First lesson",
    blurb: "Walk up, walk down. The glow will hold your hand.",
    bpm: 80,
    difficulty: 1,
    notes: score(`C4 D4 E4 F4 G4 A4 B4 C5 C5 B4 A4 G4 F4 E4 D4 C4:2`),
  },
  {
    id: "row-row",
    title: "Row Row Row Your Boat",
    composer: "Traditional",
    blurb: "Gently down the stream — then a hop up the octave.",
    bpm: 92,
    difficulty: 2,
    notes: score(
      `C4 C4 C4 D4 E4 E4 D4 E4 F4 G4:2
       C5:0.5 C5:0.5 C5:0.5 G4:0.5 G4:0.5 G4:0.5 E4:0.5 E4:0.5 E4:0.5 C4:0.5 C4:0.5 C4:0.5
       G4 F4 E4 D4 C4:2`,
    ),
  },
  {
    id: "london-bridge",
    title: "London Bridge",
    composer: "Traditional",
    blurb: "Falling, falling — then a hop back home.",
    bpm: 96,
    difficulty: 2,
    notes: score(
      `G4 A4 G4 F4 E4 F4 G4:2 D4 E4 F4:2 E4 F4 G4:2 G4 A4 G4 F4 E4 F4 G4:2 D4 G4 E4 C4:2`,
    ),
  },
  {
    id: "jingle-bells",
    title: "Jingle Bells",
    composer: "James Pierpont",
    blurb: "Bright hops in C major. Dashing all the way.",
    bpm: 112,
    difficulty: 2,
    notes: score(
      `E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4 D4 E4:2
       F4 F4 F4 F4 F4 E4 E4 E4:0.5 E4 D4 D4 E4 D4 G4:2`,
    ),
  },
  {
    id: "saints",
    title: "When the Saints Go Marching In",
    composer: "Traditional",
    blurb: "A New Orleans stroll across the white keys.",
    bpm: 100,
    difficulty: 2,
    notes: score(`C4 E4 F4 G4:2 C4 E4 F4 G4:2 C4 E4 F4 G4 E4 C4 E4 D4:2 E4 F4 G4 E4 C4 D4 C4:2`),
  },
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    composer: "Traditional",
    blurb: "Slow hops. Let each note ring before the next leap.",
    bpm: 72,
    difficulty: 2,
    notes: score(
      `G4 C5 E5 C5 E5 D5 C5 A4 G4:2
       G4 C5 E5 C5 E5 D5 C5 E5 G5:2
       E5 C5 E5 D5 C5 A4 G4:2
       G4 C5 E5 C5 E5 D5 C5:2`,
    ),
  },
  {
    id: "happy-birthday",
    title: "Happy Birthday",
    composer: "Traditional",
    blurb: "The song everyone already knows with their feet.",
    bpm: 90,
    difficulty: 3,
    notes: score(
      `G4:0.75 G4:0.25 A4 G4 C5 B4:2
       G4:0.75 G4:0.25 A4 G4 D5 C5:2
       G4:0.75 G4:0.25 G5 E5 C5 B4 A4:2
       F5:0.75 F5:0.25 E5 C5 D5 C5:2`,
    ),
  },
  {
    id: "ode-to-joy",
    title: "Ode to Joy",
    composer: "Ludwig van Beethoven",
    blurb: "An anthem, reduced to a row of glowing ivory.",
    bpm: 100,
    difficulty: 3,
    notes: score(
      `E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2
       E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2`,
    ),
  },
  {
    id: "heart-and-soul",
    title: "Heart and Soul",
    composer: "Hoagy Carmichael",
    blurb: "The duet everyone plays with two pairs of hands. Now: two feet.",
    bpm: 108,
    difficulty: 3,
    notes: score(
      `C4 C4 C4 C4 C4 C4 E4 G4 G4 G4 G4 G4 G4 E4 C4
       A4 A4 A4 A4 A4 A4 F4 A4 G4 G4 G4 G4 F4 E4 D4 C4:2`,
    ),
  },
  {
    id: "fur-elise",
    title: "Für Elise",
    composer: "Ludwig van Beethoven",
    blurb: "The famous opening — black keys invited.",
    bpm: 84,
    difficulty: 4,
    notes: score(
      `E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:2
       C4 E4 A4 B4:2 E4 G#4 B4 C5:2
       E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:2`,
    ),
  },
  {
    id: "entertainer",
    title: "The Entertainer",
    composer: "Scott Joplin",
    blurb: "Ragtime steps. Watch the leap to C.",
    bpm: 104,
    difficulty: 4,
    notes: score(
      `D4:0.5 D#4:0.5 E4 C5 E4 C5 E4 C5:2
       C5:0.5 D5:0.5 D#5:0.5 E5:0.5 C5 D5 E5 B4 D5 C5:2`,
    ),
  },
];

export const SONG_BY_ID = new Map(SONGS.map((s) => [s.id, s]));

export function beatSec(song: Song) {
  return 60 / song.bpm;
}

export function noteOnsetSec(song: Song, index: number) {
  let beats = 0;
  for (let i = 0; i < index; i++) beats += song.notes[i]!.beats;
  return beats * beatSec(song);
}

export function noteHoldSec(song: Song, index: number) {
  const note = song.notes[index];
  if (!note) return 0.4;
  return Math.max(0.16, note.beats * beatSec(song));
}

export function listenCountInSec(song: Song) {
  return LISTEN_COUNT_IN_BEATS * beatSec(song);
}

export function songDurationSec(song: Song) {
  const beats = song.notes.reduce((n, x) => n + x.beats, 0);
  return (beats * 60) / song.bpm;
}
