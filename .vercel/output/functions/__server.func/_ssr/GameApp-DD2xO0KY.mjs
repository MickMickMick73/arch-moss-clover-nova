import { i as __toESM } from "../_runtime.mjs";
import { _ as require_react, d as Color, f as MeshPhysicalMaterial, g as require_jsx_runtime, h as SRGBColorSpace, i as Html, m as RepeatWrapping, n as ContactShadows, o as Canvas, p as Object3D, r as useTexture, s as useFrame, t as Sparkles, u as CanvasTexture } from "../_libs/@react-three/drei+[...].mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as Star, c as Pause, d as Headphones, f as GraduationCap, l as Music, m as ChevronLeft, n as Volume2, o as Settings, p as CircleHelp, r as Trophy, s as Play, t as VolumeX, u as Keyboard } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/GameApp-DD2xO0KY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var pentatonic = [
	0,
	2,
	4,
	7,
	9
];
var PianoEngine = class {
	ctx = null;
	master = null;
	noise = null;
	muted = false;
	volume = .72;
	unlock() {
		if (typeof window === "undefined") return;
		if (!this.ctx) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			this.ctx = new Ctx({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.master.gain.value = this.muted ? 0 : this.volume * this.volume;
			this.master.connect(this.ctx.destination);
			this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate * .2, this.ctx.sampleRate);
			const data = this.noise.getChannelData(0);
			for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(muted) {
		this.muted = muted;
		this.applyGain();
	}
	setVolume(v) {
		this.volume = Math.max(0, Math.min(1, v));
		this.applyGain();
	}
	applyGain() {
		if (!this.ctx || !this.master) return;
		const g = this.muted ? 0 : this.volume * this.volume;
		this.master.gain.setTargetAtTime(g, this.ctx.currentTime, .03);
	}
	play(midi, velocity = .82, pan = 0, holdSec) {
		this.unlock();
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master) return;
		const now = ctx.currentTime;
		const freq = 440 * 2 ** ((midi - 69) / 12);
		const natural = 1.55 + Math.max(0, (70 - midi) / 48);
		const dur = holdSec != null ? Math.max(.28, holdSec) + .2 : natural;
		const sustainEnd = holdSec != null ? Math.max(.07, holdSec * .78) : dur * .55;
		const panner = ctx.createStereoPanner();
		panner.pan.setValueAtTime(pan, now);
		const out = ctx.createGain();
		out.connect(panner);
		panner.connect(master);
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(1800 + velocity * 2400, now);
		filter.frequency.exponentialRampToValueAtTime(700 + midi * 8, now + dur * .7);
		filter.connect(out);
		for (const [mul, gain, type] of [
			[
				1,
				.52,
				"triangle"
			],
			[
				2,
				.2,
				"sine"
			],
			[
				3,
				.09,
				"sine"
			],
			[
				4,
				.05,
				"sine"
			],
			[
				5,
				.03,
				"sine"
			],
			[
				6.02,
				.018,
				"sine"
			]
		]) {
			const osc = ctx.createOscillator();
			osc.type = type;
			osc.frequency.value = freq * mul;
			const g = ctx.createGain();
			g.gain.setValueAtTime(1e-4, now);
			g.gain.exponentialRampToValueAtTime(Math.max(1e-4, gain * velocity), now + .008);
			g.gain.exponentialRampToValueAtTime(1e-4, now + dur / Math.sqrt(mul));
			osc.connect(g);
			g.connect(filter);
			osc.start(now);
			osc.stop(now + dur + .05);
		}
		if (this.noise) {
			const hammer = ctx.createBufferSource();
			hammer.buffer = this.noise;
			const hg = ctx.createGain();
			hg.gain.setValueAtTime(.045 * velocity, now);
			hg.gain.exponentialRampToValueAtTime(1e-4, now + .03);
			const hf = ctx.createBiquadFilter();
			hf.type = "bandpass";
			hf.frequency.value = freq * 2.2;
			hf.Q.value = 1.4;
			hammer.connect(hf);
			hf.connect(hg);
			hg.connect(out);
			hammer.start(now);
			hammer.stop(now + .05);
		}
		out.gain.setValueAtTime(1, now);
		out.gain.setValueAtTime(1, now + sustainEnd);
		out.gain.exponentialRampToValueAtTime(1e-4, now + dur);
	}
	whoosh() {
		this.unlock();
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master || !this.noise) return;
		const now = ctx.currentTime;
		const src = ctx.createBufferSource();
		src.buffer = this.noise;
		const f = ctx.createBiquadFilter();
		f.type = "bandpass";
		f.frequency.setValueAtTime(400, now);
		f.frequency.exponentialRampToValueAtTime(1800, now + .16);
		const g = ctx.createGain();
		g.gain.setValueAtTime(.04, now);
		g.gain.exponentialRampToValueAtTime(1e-4, now + .18);
		src.connect(f);
		f.connect(g);
		g.connect(master);
		src.start(now);
		src.stop(now + .2);
	}
	uiTick() {
		this.unlock();
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master) return;
		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.value = 880;
		const g = ctx.createGain();
		g.gain.setValueAtTime(1e-4, now);
		g.gain.exponentialRampToValueAtTime(.07, now + .006);
		g.gain.exponentialRampToValueAtTime(1e-4, now + .09);
		osc.connect(g);
		g.connect(master);
		osc.start(now);
		osc.stop(now + .1);
	}
	countTick(accent = false) {
		this.unlock();
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master) return;
		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.value = accent ? 1320 : 990;
		const g = ctx.createGain();
		g.gain.setValueAtTime(1e-4, now);
		g.gain.exponentialRampToValueAtTime(accent ? .065 : .04, now + .004);
		g.gain.exponentialRampToValueAtTime(1e-4, now + (accent ? .09 : .06));
		osc.connect(g);
		g.connect(master);
		osc.start(now);
		osc.stop(now + .1);
	}
	arpeggio(midis, pan = 0) {
		this.unlock();
		if (!this.ctx) return;
		midis.forEach((m, i) => {
			window.setTimeout(() => this.play(m, .7, pan), i * 110);
		});
	}
	randomPentatonic() {
		return 60 + (pentatonic[Math.floor(Math.random() * pentatonic.length)] ?? 0);
	}
};
var piano = new PianoEngine();
function resumeOnVisible() {
	if (typeof document === "undefined") return;
	const kick = () => piano.unlock();
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") kick();
	});
	window.addEventListener("focus", kick);
}
var WHITE_W = .228;
var WHITE_L = 1.48;
var WHITE_H = .11;
var BLACK_W = .138;
var BLACK_L = .92;
var BLACK_H = .18;
var KEY_GAP = .012;
var PC_BLACK = /* @__PURE__ */ new Set([
	1,
	3,
	6,
	8,
	10
]);
var NOTE_NAMES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B"
];
function isBlackKey(midi) {
	return PC_BLACK.has(midi % 12);
}
function noteName(midi) {
	return `${NOTE_NAMES[(midi % 12 + 12) % 12] ?? "C"}${Math.floor(midi / 12) - 1}`;
}
function parseNote(token) {
	const m = token.match(/^([A-G])([#b]?)(\d)$/);
	if (!m) throw new Error(`Bad note: ${token}`);
	let pc = {
		C: 0,
		D: 2,
		E: 4,
		F: 5,
		G: 7,
		A: 9,
		B: 11
	}[m[1] ?? "C"] ?? 0;
	if (m[2] === "#") pc += 1;
	if (m[2] === "b") pc -= 1;
	return (Number(m[3]) + 1) * 12 + pc;
}
function buildLayout() {
	const keys = [];
	let whiteI = 0;
	for (let midi = 48; midi <= 84; midi++) {
		const black = isBlackKey(midi);
		const short = (NOTE_NAMES[midi % 12] ?? "C").replace("#", "♯");
		if (!black) {
			keys.push({
				midi,
				x: whiteI * WHITE_W,
				isBlack: false,
				name: noteName(midi),
				short
			});
			whiteI += 1;
		} else keys.push({
			midi,
			x: (whiteI - .5) * WHITE_W,
			isBlack: true,
			name: noteName(midi),
			short
		});
	}
	const mid = (whiteI - 1) * WHITE_W / 2;
	for (const key of keys) key.x -= mid;
	return keys;
}
var LAYOUT = buildLayout();
var LAYOUT_BY_MIDI = new Map(LAYOUT.map((k) => [k.midi, k]));
var whites = LAYOUT.filter((k) => !k.isBlack);
var KEYBOARD_WIDTH = whites.length * WHITE_W;
var CASE_WIDTH = KEYBOARD_WIDTH + .55;
/** Two-hand QWERTY piano. Left = bass C3–C4, right = treble C4–G5. Arrows hop. */
var PC_TO_MIDI = {
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
	Backslash: 81
};
Object.fromEntries(Object.entries(PC_TO_MIDI).map(([code, midi]) => [midi, code]));
function codeCaption(code) {
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
var LEFT_BLACK = [
	{
		code: "KeyS",
		midi: 49
	},
	{
		code: "KeyD",
		midi: 51
	},
	{
		code: "KeyG",
		midi: 54,
		gap: true
	},
	{
		code: "KeyH",
		midi: 56
	},
	{
		code: "KeyJ",
		midi: 58
	}
];
var LEFT_WHITE = [
	{
		code: "KeyZ",
		midi: 48
	},
	{
		code: "KeyX",
		midi: 50
	},
	{
		code: "KeyC",
		midi: 52
	},
	{
		code: "KeyV",
		midi: 53
	},
	{
		code: "KeyB",
		midi: 55
	},
	{
		code: "KeyN",
		midi: 57
	},
	{
		code: "KeyM",
		midi: 59
	},
	{
		code: "Comma",
		midi: 60
	}
];
var RIGHT_BLACK = [
	{
		code: "Digit2",
		midi: 61
	},
	{
		code: "Digit3",
		midi: 63
	},
	{
		code: "Digit5",
		midi: 66,
		gap: true
	},
	{
		code: "Digit6",
		midi: 68
	},
	{
		code: "Digit7",
		midi: 70
	},
	{
		code: "Digit9",
		midi: 73,
		gap: true
	},
	{
		code: "Digit0",
		midi: 75
	},
	{
		code: "Minus",
		midi: 78,
		gap: true
	},
	{
		code: "Equal",
		midi: 80
	}
];
var RIGHT_WHITE = [
	{
		code: "KeyQ",
		midi: 60
	},
	{
		code: "KeyW",
		midi: 62
	},
	{
		code: "KeyE",
		midi: 64
	},
	{
		code: "KeyR",
		midi: 65
	},
	{
		code: "KeyT",
		midi: 67
	},
	{
		code: "KeyY",
		midi: 69
	},
	{
		code: "KeyU",
		midi: 71
	},
	{
		code: "KeyI",
		midi: 72
	},
	{
		code: "KeyO",
		midi: 74
	},
	{
		code: "KeyP",
		midi: 76
	},
	{
		code: "BracketLeft",
		midi: 77
	},
	{
		code: "BracketRight",
		midi: 79
	}
];
function whiteKeyCut(midi) {
	const cut = BLACK_W * .52;
	return {
		left: isBlackKey(midi - 1) && midi - 1 >= 48 ? cut : 0,
		right: isBlackKey(midi + 1) && midi + 1 <= 84 ? cut : 0
	};
}
function getKey(midi) {
	return LAYOUT_BY_MIDI.get(midi) ?? LAYOUT[Math.floor(LAYOUT.length / 2)];
}
function standPos(midi) {
	const key = getKey(midi);
	const y = key.isBlack ? .29 : WHITE_H;
	const z = key.isBlack ? BLACK_L * .46 : WHITE_L * .62;
	return {
		x: key.x,
		y,
		z
	};
}
function nextWhite(midi, dir) {
	const cur = getKey(midi);
	if (cur.isBlack) {
		const candidates = whites.filter((w) => dir < 0 ? w.x < cur.x : w.x > cur.x);
		if (candidates.length === 0) return null;
		return dir < 0 ? candidates[candidates.length - 1] ?? null : candidates[0] ?? null;
	}
	return whites[whites.findIndex((w) => w.midi === midi) + dir] ?? null;
}
function stereoPan(x) {
	const half = KEYBOARD_WIDTH / 2;
	return Math.max(-.85, Math.min(.85, half === 0 ? 0 : x / half));
}
function score(src, defaultBeats = 1) {
	return src.trim().split(/\s+/).map((tok) => {
		const [name, beats] = tok.split(":");
		if (!name) throw new Error(`Empty note in: ${src}`);
		return {
			midi: parseNote(name),
			beats: beats ? Number(beats) : defaultBeats
		};
	});
}
var SONGS = [
	{
		id: "chopsticks",
		title: "Chopsticks",
		composer: "Euphemia Allen",
		blurb: "The hopping classic. Two keys, one tiny maestro.",
		bpm: 96,
		difficulty: 2,
		notes: score(`F5:0.5 G5:0.5 F5:0.5 G5:0.5 F5:0.5 G5:0.5 F5:0.5 G5:0.5
       E5:0.5 G5:0.5 E5:0.5 G5:0.5 E5:0.5 G5:0.5 E5:0.5 G5:0.5
       D5:0.5 F5:0.5 D5:0.5 F5:0.5 D5:0.5 F5:0.5 D5:0.5 F5:0.5
       C5:0.5 E5:0.5 C5:0.5 E5:0.5 C5:0.5 E5:0.5 C5:0.5 E5:0.5
       C5 E5 G5 C6:2 G5 E5 C5:2`)
	},
	{
		id: "hot-cross-buns",
		title: "Hot Cross Buns",
		composer: "Traditional",
		blurb: "Three notes. The first hop of every pianist.",
		bpm: 88,
		difficulty: 1,
		notes: score(`E4 D4 C4:2 E4 D4 C4:2 C4:0.5 C4:0.5 C4:0.5 C4:0.5 D4:0.5 D4:0.5 D4:0.5 D4:0.5 E4 D4 C4:2`)
	},
	{
		id: "twinkle",
		title: "Twinkle Twinkle Little Star",
		composer: "Traditional",
		blurb: "Look up. Then look down. Then hop.",
		bpm: 92,
		difficulty: 2,
		notes: score(`C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2
       G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2
       C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2`)
	},
	{
		id: "mary",
		title: "Mary Had a Little Lamb",
		composer: "Traditional",
		blurb: "A gentle walk down the white keys.",
		bpm: 96,
		difficulty: 1,
		notes: score(`E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:2`)
	},
	{
		id: "scale",
		title: "C Major Scale",
		composer: "First lesson",
		blurb: "Walk up, walk down. The glow will hold your hand.",
		bpm: 80,
		difficulty: 1,
		notes: score(`C4 D4 E4 F4 G4 A4 B4 C5 C5 B4 A4 G4 F4 E4 D4 C4:2`)
	},
	{
		id: "row-row",
		title: "Row Row Row Your Boat",
		composer: "Traditional",
		blurb: "Gently down the stream — then a hop up the octave.",
		bpm: 92,
		difficulty: 2,
		notes: score(`C4 C4 C4 D4 E4 E4 D4 E4 F4 G4:2
       C5:0.5 C5:0.5 C5:0.5 G4:0.5 G4:0.5 G4:0.5 E4:0.5 E4:0.5 E4:0.5 C4:0.5 C4:0.5 C4:0.5
       G4 F4 E4 D4 C4:2`)
	},
	{
		id: "london-bridge",
		title: "London Bridge",
		composer: "Traditional",
		blurb: "Falling, falling — then a hop back home.",
		bpm: 96,
		difficulty: 2,
		notes: score(`G4 A4 G4 F4 E4 F4 G4:2 D4 E4 F4:2 E4 F4 G4:2 G4 A4 G4 F4 E4 F4 G4:2 D4 G4 E4 C4:2`)
	},
	{
		id: "jingle-bells",
		title: "Jingle Bells",
		composer: "James Pierpont",
		blurb: "Bright hops in C major. Dashing all the way.",
		bpm: 112,
		difficulty: 2,
		notes: score(`E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4 D4 E4:2
       F4 F4 F4 F4 F4 E4 E4 E4:0.5 E4 D4 D4 E4 D4 G4:2`)
	},
	{
		id: "saints",
		title: "When the Saints Go Marching In",
		composer: "Traditional",
		blurb: "A New Orleans stroll across the white keys.",
		bpm: 100,
		difficulty: 2,
		notes: score(`C4 E4 F4 G4:2 C4 E4 F4 G4:2 C4 E4 F4 G4 E4 C4 E4 D4:2 E4 F4 G4 E4 C4 D4 C4:2`)
	},
	{
		id: "amazing-grace",
		title: "Amazing Grace",
		composer: "Traditional",
		blurb: "Slow hops. Let each note ring before the next leap.",
		bpm: 72,
		difficulty: 2,
		notes: score(`G4 C5 E5 C5 E5 D5 C5 A4 G4:2
       G4 C5 E5 C5 E5 D5 C5 E5 G5:2
       E5 C5 E5 D5 C5 A4 G4:2
       G4 C5 E5 C5 E5 D5 C5:2`)
	},
	{
		id: "happy-birthday",
		title: "Happy Birthday",
		composer: "Traditional",
		blurb: "The song everyone already knows with their feet.",
		bpm: 90,
		difficulty: 3,
		notes: score(`G4:0.75 G4:0.25 A4 G4 C5 B4:2
       G4:0.75 G4:0.25 A4 G4 D5 C5:2
       G4:0.75 G4:0.25 G5 E5 C5 B4 A4:2
       F5:0.75 F5:0.25 E5 C5 D5 C5:2`)
	},
	{
		id: "ode-to-joy",
		title: "Ode to Joy",
		composer: "Ludwig van Beethoven",
		blurb: "An anthem, reduced to a row of glowing ivory.",
		bpm: 100,
		difficulty: 3,
		notes: score(`E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2
       E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2`)
	},
	{
		id: "heart-and-soul",
		title: "Heart and Soul",
		composer: "Hoagy Carmichael",
		blurb: "The duet everyone plays with two pairs of hands. Now: two feet.",
		bpm: 108,
		difficulty: 3,
		notes: score(`C4 C4 C4 C4 C4 C4 E4 G4 G4 G4 G4 G4 G4 E4 C4
       A4 A4 A4 A4 A4 A4 F4 A4 G4 G4 G4 G4 F4 E4 D4 C4:2`)
	},
	{
		id: "fur-elise",
		title: "Für Elise",
		composer: "Ludwig van Beethoven",
		blurb: "The famous opening — black keys invited.",
		bpm: 84,
		difficulty: 4,
		notes: score(`E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:2
       C4 E4 A4 B4:2 E4 G#4 B4 C5:2
       E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:2`)
	},
	{
		id: "entertainer",
		title: "The Entertainer",
		composer: "Scott Joplin",
		blurb: "Ragtime steps. Watch the leap to C.",
		bpm: 104,
		difficulty: 4,
		notes: score(`D4:0.5 D#4:0.5 E4 C5 E4 C5 E4 C5:2
       C5:0.5 D5:0.5 D#5:0.5 E5:0.5 C5 D5 E5 B4 D5 C5:2`)
	}
];
var SONG_BY_ID = new Map(SONGS.map((s) => [s.id, s]));
function beatSec(song) {
	return 60 / song.bpm;
}
function noteOnsetSec(song, index) {
	let beats = 0;
	for (let i = 0; i < index; i++) beats += song.notes[i].beats;
	return beats * beatSec(song);
}
function noteHoldSec(song, index) {
	const note = song.notes[index];
	if (!note) return .4;
	return Math.max(.16, note.beats * beatSec(song));
}
function listenCountInSec(song) {
	return 2 * beatSec(song);
}
function songDurationSec(song) {
	return song.notes.reduce((n, x) => n + x.beats, 0) * 60 / song.bpm;
}
var initialRuntime = {
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
	pendingMidi: null
};
function starScore(hits, misses, perfects, total) {
	if (total <= 0) return 0;
	const accuracy = hits / total;
	const perfectRate = perfects / total;
	if (accuracy >= .96 && perfectRate >= .45) return 3;
	if (accuracy >= .8) return 3;
	if (accuracy >= .6) return 2;
	if (hits > 0) return 1;
	return 0;
}
var useGame = create()(persist((set, get) => ({
	stars: {},
	master: .72,
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
	goTitle: () => set({
		screen: "title",
		camWide: true,
		paused: false,
		settingsOpen: false
	}),
	goSongs: () => set({
		screen: "songs",
		camWide: true,
		paused: false,
		settingsOpen: false
	}),
	goHowto: () => set({
		screen: "howto",
		camWide: true,
		settingsOpen: false
	}),
	startSong: (id, mode) => {
		if (!SONG_BY_ID.get(id)) return;
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
			pendingMidi: null
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
			pendingMidi: null
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
		const add = (judge === "perfect" ? 300 : judge === "good" ? 200 : 120) * (1 + Math.min(combo, 20) * .05);
		set({
			hits: s.hits + 1,
			combo,
			maxCombo: Math.max(s.maxCombo, combo),
			perfects: s.perfects + (judge === "perfect" ? 1 : 0),
			score: s.score + Math.round(add),
			lastJudge: judge,
			noteIndex: s.noteIndex + 1
		});
	},
	registerMiss: () => {
		set({
			misses: get().misses + 1,
			combo: 0,
			lastJudge: "miss"
		});
	},
	finish: () => {
		const s = get();
		if (s.finished) return;
		const total = (s.songId ? SONG_BY_ID.get(s.songId) : void 0)?.notes.length ?? 0;
		const stars = s.mode === "free" || s.mode === "demo" ? 0 : starScore(s.hits, s.misses, s.perfects, total);
		const key = s.songId && (s.mode === "learn" || s.mode === "recital") ? `${s.songId}:${s.mode}` : null;
		const nextStars = { ...s.stars };
		if (key) nextStars[key] = Math.max(nextStars[key] ?? 0, stars);
		piano.arpeggio([
			60,
			64,
			67,
			72
		]);
		set({
			finished: true,
			screen: "results",
			camWide: true,
			stars: nextStars,
			paused: false
		});
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
	toggleSettings: (v) => set({ settingsOpen: v ?? !get().settingsOpen })
}), {
	name: "ivory-hopper-v1",
	version: 1,
	partialize: (s) => ({
		stars: s.stars,
		master: s.master,
		muted: s.muted,
		shake: s.shake,
		showNames: s.showNames,
		showKeyboard: s.showKeyboard
	})
}));
function currentSong() {
	const id = useGame.getState().songId;
	return id ? SONG_BY_ID.get(id) : void 0;
}
function starsFor(id, mode) {
	return useGame.getState().stars[`${id}:${mode}`] ?? 0;
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function sat(t) {
	return Math.max(0, Math.min(1, t));
}
function damp(cur, target, lambda, dt) {
	return lerp(cur, target, 1 - Math.exp(-lambda * dt));
}
function easeInOut(t) {
	return t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
function prefersReduced() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function makeSim() {
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
		press: /* @__PURE__ */ new Map(),
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
		qaKeys: /* @__PURE__ */ new Set(),
		held: /* @__PURE__ */ new Set(),
		prevHeld: /* @__PURE__ */ new Set()
	};
}
function setSheetFrame(tex, frame) {
	const col = frame % 2;
	const row = Math.floor(frame / 2);
	tex.repeat.set(.5, .5);
	tex.offset.set(col * .5, .5 - row * .5);
}
function PianoWorld() {
	const sim = (0, import_react.useRef)(makeSim());
	const cam = (0, import_react.useRef)({
		x: .35,
		y: 1.85,
		z: 4.85,
		lx: .05,
		ly: .42,
		lz: .45
	});
	const playId = useGame((s) => s.playId);
	(0, import_react.useLayoutEffect)(() => {
		const song = currentSong();
		const mode = useGame.getState().mode;
		const target = song?.notes[0]?.midi ?? 60;
		const startMidi = mode === "free" ? 60 : nextWhite(target, -1)?.midi ?? target;
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
	(0, import_react.useEffect)(() => {
		window.__controlsTest = {
			getYaw: () => 0,
			getX: () => sim.current.x,
			getSpeed: () => sim.current.jump ? 1 : 0,
			getMidi: () => sim.current.midi,
			setKeys: (codes) => {
				sim.current.qaKeys = new Set(codes);
			}
		};
		return () => {
			delete window.__controlsTest;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: ["#0c0b0a"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				"#0c0b0a",
				18,
				42
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lights, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hall, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageFloor, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PianoCase, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keys, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlowBeacons, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetArrow, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maestro, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HitBurst, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandDust, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, {
			sim,
			cam
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactShadows, {
			position: [
				0,
				-1.2,
				.2
			],
			opacity: .45,
			scale: 14,
			blur: 2.2,
			far: 3.5
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			count: prefersReduced() ? 0 : 48,
			scale: [
				12,
				3.2,
				7
			],
			size: 2.2,
			speed: .28,
			opacity: .36,
			color: "#e8dfd0"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputHost, { sim })
	] });
}
function Lights() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			"#f0d4a8",
			"#16110f",
			.55
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .2 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				1.8,
				7.4,
				5.2
			],
			angle: .5,
			penumbra: .72,
			intensity: 95,
			distance: 26,
			color: "#ffe4c2",
			castShadow: true,
			"shadow-mapSize-width": 1024,
			"shadow-mapSize-height": 1024,
			"shadow-bias": -2e-4
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				-5.2,
				4.6,
				2.2
			],
			angle: .55,
			penumbra: .85,
			intensity: 22,
			color: "#9bb3c4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				0,
				6.8,
				1.6
			],
			angle: .38,
			penumbra: .9,
			intensity: 28,
			color: "#ffd7a8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				0,
				2.1,
				1.2
			],
			intensity: 7,
			color: "#f3ece0",
			distance: 10
		})
	] });
}
function Hall() {
	const map = useTexture("/game/hall.jpg");
	const curtain = useTexture("/game/curtain.jpg");
	(0, import_react.useLayoutEffect)(() => {
		map.colorSpace = SRGBColorSpace;
		map.anisotropy = 8;
		curtain.colorSpace = SRGBColorSpace;
		curtain.anisotropy = 8;
		curtain.offset.set(0, .08);
		curtain.repeat.set(1, .92);
	}, [map, curtain]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				3.45,
				-10.4
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [21.4, 12] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { map })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-9.6,
				2.35,
				-5.6
			],
			rotation: [
				0,
				.42,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [4.6, 8] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { map: curtain })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				9.6,
				2.35,
				-5.6
			],
			rotation: [
				0,
				-.42,
				0
			],
			scale: [
				-1,
				1,
				1
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [4.6, 8] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { map: curtain })]
		})
	] });
}
function StageFloor() {
	const map = useTexture("/game/textures/stage.jpg");
	(0, import_react.useLayoutEffect)(() => {
		map.colorSpace = SRGBColorSpace;
		map.wrapS = map.wrapT = RepeatWrapping;
		map.repeat.set(2.4, 2.4);
		map.anisotropy = 8;
	}, [map]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		position: [
			0,
			-1.22,
			.4
		],
		receiveShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [28, 22] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			map,
			roughness: .55,
			metalness: .08,
			color: "#1a1614"
		})]
	});
}
function GlowBeacons() {
	const group = (0, import_react.useRef)(null);
	const ring = (0, import_react.useRef)(null);
	const shaft = (0, import_react.useRef)(null);
	const light = (0, import_react.useRef)(null);
	const ghosts = (0, import_react.useRef)([null, null]);
	useFrame((state) => {
		const st = useGame.getState();
		const song = currentSong();
		const playing = st.screen === "play" && st.mode !== "free" && !st.finished && !st.paused;
		const next = song?.notes[st.noteIndex];
		const pulse = .55 + .45 * Math.sin(state.clock.elapsedTime * 5.2);
		if (group.current) {
			if (playing && next) {
				const p = standPos(next.midi);
				const key = getKey(next.midi);
				group.current.visible = true;
				group.current.position.set(key.x, p.y + .02, p.z);
				if (ring.current) ring.current.opacity = .45 + pulse * .5;
				if (shaft.current) shaft.current.opacity = .22 + pulse * .22;
				if (light.current) light.current.intensity = 5.5 + pulse * 6;
			} else group.current.visible = false;
		}
		[song?.notes[st.noteIndex + 1], song?.notes[st.noteIndex + 2]].forEach((note, i) => {
			const g = ghosts.current[i];
			if (!g) return;
			if (playing && st.mode === "learn" && note) {
				const p = standPos(note.midi);
				const key = getKey(note.midi);
				g.visible = true;
				g.position.set(key.x, p.y + .02, p.z);
				g.scale.setScalar(.72 - i * .12);
			} else g.visible = false;
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: group,
			visible: false,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					rotation: [
						-Math.PI / 2,
						0,
						0
					],
					position: [
						0,
						.012,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
						.055,
						.15,
						28
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						ref: ring,
						color: "#7dcec4",
						transparent: true,
						opacity: .7,
						depthWrite: false
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						.72,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.034,
						.1,
						1.42,
						12
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						ref: shaft,
						color: "#9ee8dc",
						transparent: true,
						opacity: .32,
						depthWrite: false
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					ref: light,
					color: "#7dcec4",
					distance: 2.6,
					intensity: 6
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: (el) => {
				ghosts.current[0] = el;
			},
			visible: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					.05,
					.11,
					20
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#5aa89c",
					transparent: true,
					opacity: .35,
					depthWrite: false
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: (el) => {
				ghosts.current[1] = el;
			},
			visible: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					.05,
					.1,
					20
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#3d7a72",
					transparent: true,
					opacity: .22,
					depthWrite: false
				})]
			})
		})
	] });
}
function PianoCase() {
	const w = CASE_WIDTH;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				-.08,
				-.55
			],
			castShadow: true,
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				w,
				.22,
				2.55
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				color: "#0e0d0c",
				roughness: .2,
				metalness: .32,
				clearcoat: 1,
				clearcoatRoughness: .14
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.42,
				-1.72
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				w,
				.95,
				.22
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				color: "#0e0d0c",
				roughness: .2,
				metalness: .3,
				clearcoat: 1,
				clearcoatRoughness: .14
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				1.55,
				-1.55
			],
			rotation: [
				Math.PI * -.58,
				0,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				w - .08,
				.045,
				2.15
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				color: "#121110",
				roughness: .16,
				metalness: .38,
				clearcoat: 1,
				clearcoatRoughness: .1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.72,
				-1.62
			],
			rotation: [
				.15,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.04,
				1.35,
				.04
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#b39868",
				metalness: 1,
				roughness: .32
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.08,
				-.02
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				w - .12,
				.06,
				WHITE_L + .08
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#1a1816",
				roughness: .5
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				WHITE_H + .003,
				.03
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [KEYBOARD_WIDTH - .08, .05] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#6e1e24",
				roughness: .92
			})]
		}),
		[
			[
				-w * .38,
				-.66,
				.35
			],
			[
				w * .38,
				-.66,
				.35
			],
			[
				0,
				-.66,
				-1.55
			]
		].map(([x, y, z], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: [
				x,
				y,
				z
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.055,
					.07,
					1.12,
					12
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
					color: "#0e0d0c",
					roughness: .22,
					metalness: .3,
					clearcoat: .8
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					-.58,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.11,
					.12,
					.06,
					16
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#b39868",
					metalness: 1,
					roughness: .3
				})]
			})]
		}, i)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDesk, {})
	] });
}
function SheetDesk() {
	const title = useGame((s) => s.songId ? s.songId : "free") === "free" ? "Free Play" : currentSong()?.title ?? "Ivory Hopper";
	const tex = (0, import_react.useMemo)(() => {
		const c = document.createElement("canvas");
		c.width = 512;
		c.height = 360;
		const g = c.getContext("2d");
		if (!g) return new CanvasTexture(c);
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
		g.font = "600 34px \"Cormorant Garamond\", serif";
		g.textAlign = "center";
		g.fillText(title, 256, 78);
		g.font = "500 16px Figtree, sans-serif";
		g.fillStyle = "#6e6860";
		g.fillText("Ivory Hopper", 256, 318);
		const t = new CanvasTexture(c);
		t.colorSpace = SRGBColorSpace;
		return t;
	}, [title]);
	(0, import_react.useEffect)(() => () => tex.dispose(), [tex]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-.38,
				.95,
				-.22
			],
			rotation: [
				.1,
				0,
				.08
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.03,
				.55,
				.03
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#1a1816" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.38,
				.95,
				-.22
			],
			rotation: [
				.1,
				0,
				-.08
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.03,
				.55,
				.03
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#1a1816" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				1.18,
				-.16
			],
			rotation: [
				-.4,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.95, .66] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: tex,
				roughness: .72
			})]
		})
	] });
}
var labelCache = /* @__PURE__ */ new Map();
function labelTexture(text) {
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
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	labelCache.set(text, t);
	return t;
}
function Keys({ sim }) {
	const ivory = useTexture("/game/textures/ivory.jpg");
	const ebony = useTexture("/game/textures/ebony.jpg");
	const groups = (0, import_react.useRef)([]);
	const materials = (0, import_react.useMemo)(() => LAYOUT.map((key) => new MeshPhysicalMaterial({
		color: key.isBlack ? "#0a0909" : "#f3eee6",
		roughness: key.isBlack ? .24 : .4,
		metalness: key.isBlack ? .16 : .04,
		clearcoat: key.isBlack ? 1 : .58,
		clearcoatRoughness: key.isBlack ? .1 : .26,
		emissive: new Color("#000000"),
		emissiveIntensity: 0
	})), []);
	(0, import_react.useLayoutEffect)(() => {
		ivory.colorSpace = SRGBColorSpace;
		ebony.colorSpace = SRGBColorSpace;
		ivory.wrapS = ivory.wrapT = RepeatWrapping;
		ebony.wrapS = ebony.wrapT = RepeatWrapping;
		ivory.repeat.set(.55, 1.6);
		ebony.repeat.set(.7, 1.4);
		ivory.anisotropy = 8;
		ebony.anisotropy = 8;
		LAYOUT.forEach((key, i) => {
			const mat = materials[i];
			if (!mat) return;
			mat.map = key.isBlack ? ebony : ivory;
			mat.needsUpdate = true;
		});
	}, [
		ivory,
		ebony,
		materials
	]);
	(0, import_react.useEffect)(() => () => materials.forEach((m) => m.dispose()), [materials]);
	const onKey = (midi) => {
		requestJump(sim.current, midi);
	};
	useFrame((_, raw) => {
		const dt = Math.min(raw, .1);
		const s = sim.current;
		const st = useGame.getState();
		const song = currentSong();
		const next = song?.notes[st.noteIndex];
		const n1 = song?.notes[st.noteIndex + 1];
		const n2 = song?.notes[st.noteIndex + 2];
		const pulse = .55 + .45 * Math.sin(performance.now() * .006);
		LAYOUT.forEach((key, i) => {
			const g = groups.current[i];
			const mat = materials[i];
			if (!g || !mat) return;
			const press = s.press.get(key.midi) ?? 0;
			s.press.set(key.midi, Math.max(0, press - dt * 3.4));
			const amount = s.press.get(key.midi) ?? 0;
			const baseY = key.isBlack ? WHITE_H + BLACK_H / 2 : WHITE_H / 2;
			g.position.y = baseY - amount * .038;
			g.rotation.x = amount * .055;
			let er = 0, eg = 0, eb = 0, em = 0;
			const playing = st.screen === "play" && st.mode !== "free" && !st.finished;
			if (playing && next && key.midi === next.midi) {
				er = .32 * pulse;
				eg = .86 * pulse;
				eb = .74 * pulse;
				em = 1.15;
			} else if (playing && st.mode === "learn" && n1 && key.midi === n1.midi) {
				er = .12;
				eg = .4;
				eb = .34;
				em = .42;
			} else if (playing && st.mode === "learn" && n2 && key.midi === n2.midi) {
				er = .06;
				eg = .2;
				eb = .17;
				em = .22;
			}
			if (amount > .2) {
				er = Math.max(er, .62);
				eg = Math.max(eg, .52);
				eb = Math.max(eb, .38);
				em = Math.max(em, .82);
			}
			mat.emissive.setRGB(er, eg, eb);
			mat.emissiveIntensity = em;
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [LAYOUT.map((key, i) => {
		const mat = materials[i];
		const z = key.isBlack ? BLACK_L / 2 - .02 : WHITE_L / 2;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: (el) => {
				if (el) groups.current[i] = el;
			},
			position: [
				key.x,
				key.isBlack ? WHITE_H + BLACK_H / 2 : WHITE_H / 2,
				z
			],
			children: [key.isBlack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyMesh, {
				args: [
					BLACK_W,
					BLACK_H,
					BLACK_L
				],
				material: mat,
				midi: key.midi,
				onKey
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhiteKeyMeshes, {
				midi: key.midi,
				material: mat,
				onKey
			}), !key.isBlack && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.056,
					1.48 / 2 - .16
				],
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.15552, .11] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					map: labelTexture(key.short),
					transparent: true,
					depthWrite: false
				})]
			})]
		}, key.midi);
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetLabel, { sim })] });
}
function pointerBind(midi, onKey) {
	return {
		onPointerDown: (e) => {
			e.stopPropagation();
			onKey(midi);
		},
		onPointerOver: () => {
			document.body.style.cursor = "pointer";
		},
		onPointerOut: () => {
			document.body.style.cursor = "auto";
		}
	};
}
function KeyMesh({ args, material, midi, onKey }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		castShadow: true,
		receiveShadow: true,
		material,
		...pointerBind(midi, onKey),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args })
	});
}
function WhiteKeyMeshes({ midi, material, onKey }) {
	const { left, right } = whiteKeyCut(midi);
	const W = WHITE_W - KEY_GAP;
	const frontL = WHITE_L - BLACK_L + .03;
	const backW = Math.max(.04, W - left - right);
	const backX = (left - right) / 2;
	const backZ = -WHITE_L / 2 + BLACK_L / 2;
	const frontZ = WHITE_L / 2 - frontL / 2;
	const bind = pointerBind(midi, onKey);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		position: [
			backX,
			0,
			backZ
		],
		castShadow: true,
		receiveShadow: true,
		material,
		...bind,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			backW,
			WHITE_H,
			BLACK_L
		] })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		position: [
			0,
			0,
			frontZ
		],
		castShadow: true,
		receiveShadow: true,
		material,
		...bind,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			W,
			WHITE_H,
			frontL
		] })
	})] });
}
function TargetArrow() {
	const ref = (0, import_react.useRef)(null);
	useFrame((state) => {
		const g = ref.current;
		if (!g) return;
		const st = useGame.getState();
		const next = currentSong()?.notes[st.noteIndex];
		if (st.screen === "play" && st.mode !== "free" && !st.finished && !st.paused && next) {
			const p = standPos(next.midi);
			const key = getKey(next.midi);
			const bob = prefersReduced() ? 0 : Math.sin(state.clock.elapsedTime * 6.2) * .07;
			g.visible = true;
			g.position.set(key.x, p.y + .58 + bob, p.z);
		} else g.visible = false;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref,
		visible: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				Math.PI,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
				.055,
				.13,
				4
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#7dcec4" })]
		})
	});
}
function LandDust({ sim }) {
	const count = 16;
	const mesh = (0, import_react.useRef)(null);
	const dummy = (0, import_react.useMemo)(() => new Object3D(), []);
	const seen = (0, import_react.useRef)(0);
	const parts = (0, import_react.useRef)(Array.from({ length: count }, () => ({
		life: 0,
		x: 0,
		y: 0,
		z: 0,
		vx: 0,
		vz: 0,
		max: .4
	})));
	useFrame((_, raw) => {
		const dt = Math.min(raw, .1);
		const s = sim.current;
		const im = mesh.current;
		if (!im) return;
		if (s.landTick !== seen.current) {
			seen.current = s.landTick;
			parts.current.forEach((p, i) => {
				const a = i / count * Math.PI * 2 + Math.random() * .2;
				const spd = .35 + Math.random() * .4;
				p.life = .32 + Math.random() * .14;
				p.max = p.life;
				p.x = s.x;
				p.y = s.y + .03;
				p.z = s.z;
				p.vx = Math.cos(a) * spd;
				p.vz = Math.sin(a) * spd;
			});
		}
		parts.current.forEach((p, i) => {
			if (p.life <= 0) dummy.scale.set(0, 0, 0);
			else {
				p.life -= dt;
				p.x += p.vx * dt;
				p.z += p.vz * dt;
				p.y += dt * .18;
				const u = 1 - Math.max(0, p.life) / p.max;
				dummy.position.set(p.x, p.y, p.z);
				dummy.scale.setScalar(.028 + u * .07);
			}
			dummy.updateMatrix();
			im.setMatrixAt(i, dummy.matrix);
		});
		im.instanceMatrix.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: mesh,
		args: [
			void 0,
			void 0,
			count
		],
		frustumCulled: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			6,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#e8dfd0",
			transparent: true,
			opacity: .42,
			depthWrite: false
		})]
	});
}
function TargetLabel({ sim }) {
	const show = useGame((s) => s.showNames && s.screen === "play" && s.mode !== "free" && !s.paused);
	const noteIndex = useGame((s) => s.noteIndex);
	const next = currentSong()?.notes[noteIndex];
	if (!show || !next) return null;
	const key = getKey(next.midi);
	const p = standPos(next.midi);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
		position: [
			key.x,
			p.y + .42,
			p.z
		],
		center: true,
		sprite: true,
		style: { pointerEvents: "none" },
		zIndexRange: [10, 0],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-full bg-accent/92 px-2.5 py-0.5 font-display text-[13px] tracking-wide text-accent-fg shadow-panel",
			children: key.short
		})
	});
}
function Maestro({ sim }) {
	const idle = useTexture("/game/maestro-idle.png");
	const jump = useTexture("/game/maestro-jump.png");
	const hop = useTexture("/game/maestro-hop.png");
	const sprite = (0, import_react.useRef)(null);
	const blob = (0, import_react.useRef)(null);
	const lamp = (0, import_react.useRef)(null);
	const maps = (0, import_react.useMemo)(() => ({
		idle,
		jump,
		hop
	}), [
		idle,
		jump,
		hop
	]);
	(0, import_react.useLayoutEffect)(() => {
		for (const t of [
			idle,
			jump,
			hop
		]) {
			t.colorSpace = SRGBColorSpace;
			t.repeat.set(.5, .5);
			t.offset.set(0, .5);
		}
	}, [
		idle,
		jump,
		hop
	]);
	useFrame((_, raw) => {
		const dt = Math.min(raw, .1);
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
			frame = sat(u) < .18 ? 0 : sat(u) < .45 ? 1 : sat(u) < .78 ? 2 : 3;
		} else tex = maps.idle;
		setSheetFrame(tex, frame);
		const sp = sprite.current;
		if (sp) {
			sp.material.map = tex;
			sp.material.needsUpdate = true;
			let sy = 1.05;
			let sx = .8 * s.facing;
			if (s.jump) {
				const u = sat(s.jump.t / s.jump.dur);
				if (u < .12) {
					sy *= .86;
					sx *= 1.14;
				} else if (u < .55) {
					sy *= 1.14;
					sx *= .88;
				}
			} else {
				const land = s.press.get(s.midi) ?? 0;
				sy *= 1 - land * .14;
				sx *= 1 + land * .12;
				sy *= 1 + Math.sin(performance.now() * .004) * .015;
			}
			sp.scale.set(sx, sy, 1);
			sp.position.set(s.x, s.y + Math.abs(sy) * .5 - .01, s.z);
		}
		if (blob.current) {
			blob.current.position.set(s.x, s.y + .01, s.z + .02);
			const sc = .22 * (s.jump ? .55 : 1);
			blob.current.scale.set(sc, sc, sc);
		}
		if (lamp.current) lamp.current.position.set(s.x, s.y + .95, s.z + .28);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sprite", {
			ref: sprite,
			scale: [
				.8,
				1.05,
				1
			],
			renderOrder: 2,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("spriteMaterial", {
				transparent: true,
				alphaTest: .18,
				depthWrite: false
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: blob,
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			renderOrder: 1,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [1, 20] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: "#000000",
				transparent: true,
				opacity: .32
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			ref: lamp,
			color: "#ffe6c8",
			intensity: 2.6,
			distance: 3.1
		})
	] });
}
function HitBurst({ sim }) {
	const tex = useTexture("/game/sparkle.png");
	const sprite = (0, import_react.useRef)(null);
	const life = (0, import_react.useRef)(0);
	(0, import_react.useLayoutEffect)(() => {
		tex.colorSpace = SRGBColorSpace;
		tex.repeat.set(.5, .5);
	}, [tex]);
	useFrame((_, raw) => {
		const dt = Math.min(raw, .1);
		const sp = sprite.current;
		if (!sp) return;
		if (life.current > 0) {
			life.current -= dt;
			const u = 1 - sat(life.current / .38);
			setSheetFrame(tex, u < .25 ? 0 : u < .5 ? 1 : u < .75 ? 2 : 3);
			const sc = .35 + u * .55;
			sp.scale.set(sc, sc, 1);
			sp.material.opacity = 1 - u;
			sp.visible = true;
			sp.position.set(sim.current.x, sim.current.y + .35, sim.current.z + .04);
		} else sp.visible = false;
		if ((sim.current.press.get(sim.current.midi) ?? 0) > .85 && life.current <= 0) life.current = .38;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sprite", {
		ref: sprite,
		visible: false,
		renderOrder: 3,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("spriteMaterial", {
			map: tex,
			transparent: true,
			depthWrite: false
		})
	});
}
function CameraRig({ sim, cam }) {
	useFrame((state, raw) => {
		const dt = Math.min(raw, .1);
		const s = sim.current;
		const st = useGame.getState();
		const mobile = state.size.width < 640;
		const wide = st.camWide;
		const lookX = wide ? 0 : s.x;
		const next = currentSong()?.notes[st.noteIndex];
		const lead = !wide && next ? getKey(next.midi).x : lookX;
		const mixX = wide ? 0 : lerp(s.x, lead, .28);
		const goal = wide ? {
			x: .35,
			y: 1.85,
			z: mobile ? 5.6 : 4.85,
			lx: .05,
			ly: .42,
			lz: .45
		} : {
			x: mixX + .12,
			y: mobile ? 2.15 : 1.85,
			z: mobile ? 3.9 : 3.35,
			lx: mixX,
			ly: .42,
			lz: .45
		};
		if ((st.screen === "title" || st.screen === "songs" || st.screen === "howto") && !prefersReduced()) {
			const t = state.clock.elapsedTime;
			goal.z += Math.sin(t * .22) * .14;
			goal.y += Math.sin(t * .17) * .05;
		}
		const c = cam.current;
		c.x = damp(c.x, goal.x, 3.2, dt);
		c.y = damp(c.y, goal.y, 3.2, dt);
		c.z = damp(c.z, goal.z, 3.2, dt);
		c.lx = damp(c.lx, goal.lx, 3.6, dt);
		c.ly = damp(c.ly, goal.ly, 3.6, dt);
		c.lz = damp(c.lz, goal.lz, 3.6, dt);
		s.trauma = Math.max(0, s.trauma - dt * 2.8);
		const sh = st.shake && !prefersReduced() ? s.trauma * s.trauma : 0;
		const t = state.clock.elapsedTime;
		state.camera.position.set(c.x + Math.sin(t * 61) * sh * .08, c.y + Math.cos(t * 53) * sh * .05, c.z);
		state.camera.lookAt(c.lx, c.ly, c.lz);
	});
	return null;
}
function InputHost({ sim }) {
	(0, import_react.useEffect)(() => {
		const down = (e) => {
			sim.current.held.add(e.code);
			if ([
				"Space",
				"ArrowLeft",
				"ArrowRight",
				"ArrowUp",
				"ArrowDown"
			].includes(e.code) || PC_TO_MIDI[e.code]) e.preventDefault();
			if (e.code === "Escape") {
				const st = useGame.getState();
				if (st.screen === "play") st.pause(!st.paused);
			}
		};
		const up = (e) => sim.current.held.delete(e.code);
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
		const dt = Math.min(raw, .1);
		const s = sim.current;
		const st = useGame.getState();
		const listening = st.mode === "demo" && st.screen === "play" && !st.finished;
		if (listening) s.songTime = listenClock(s, st.paused);
		stepJump(s, dt, st.paused, listening);
		if (st.paused) return;
		const pending = st.pendingMidi;
		if (pending != null && st.mode !== "demo") {
			useGame.getState().consumeHop();
			requestJump(s, pending);
		} else if (pending != null && st.mode === "demo") useGame.getState().consumeHop();
		const codes = /* @__PURE__ */ new Set([...s.held, ...s.qaKeys]);
		const just = (code) => codes.has(code) && !s.prevHeld.has(code);
		s.hopCool = Math.max(0, s.hopCool - dt);
		if (listening) {
			stepListen(s);
			s.prevHeld = new Set(codes);
			return;
		}
		const left = codes.has("ArrowLeft");
		const right = codes.has("ArrowRight");
		if ((just("ArrowLeft") || left && s.hopCool === 0 && s.qaKeys.size > 0) && !s.jump) {
			const n = nextWhite(s.midi, -1);
			if (n) requestJump(s, n.midi);
			s.hopCool = .22;
		}
		if ((just("ArrowRight") || right && s.hopCool === 0 && s.qaKeys.size > 0) && !s.jump) {
			const n = nextWhite(s.midi, 1);
			if (n) requestJump(s, n.midi);
			s.hopCool = .22;
		}
		if ((left || right) && s.hopCool === 0 && !s.jump) {
			const n = nextWhite(s.midi, left ? -1 : 1);
			if (n) requestJump(s, n.midi);
			s.hopCool = .24;
		}
		const struck = [];
		for (const code of codes) {
			if (!just(code)) continue;
			const mapped = PC_TO_MIDI[code];
			if (mapped == null) continue;
			strikeKey(s, mapped);
			struck.push(mapped);
		}
		if (struck.length) {
			const expected = currentSong()?.notes[useGame.getState().noteIndex]?.midi;
			requestJump(s, expected != null && struck.includes(expected) ? expected : struck[struck.length - 1], void 0, true);
		}
		if (just("Space") || just("Enter")) {
			const next = currentSong()?.notes[st.noteIndex];
			if (st.screen === "play" && st.mode === "learn" && next) requestJump(s, next.midi);
			else requestJump(s, s.midi);
		}
		if ((st.screen === "title" || st.screen === "songs" || st.screen === "howto") && !s.jump) {
			s.idleHop -= dt;
			if (s.idleHop <= 0) {
				requestJump(s, nextWhite(s.midi, Math.random() > .5 ? 1 : -1)?.midi ?? s.midi);
				s.idleHop = 3.4 + Math.random() * 2.4;
			}
		}
		if (st.screen === "play" && !st.finished && st.mode !== "free") s.songTime += dt;
		s.prevHeld = new Set(codes);
	});
	return null;
}
function listenClock(s, paused) {
	const now = performance.now();
	if (!s.clockStart) s.clockStart = now;
	if (paused) {
		if (!s.pauseStart) s.pauseStart = now;
		return (s.pauseStart - s.clockStart - s.pausedMs) / 1e3;
	}
	if (s.pauseStart) {
		s.pausedMs += now - s.pauseStart;
		s.pauseStart = 0;
	}
	return (now - s.clockStart - s.pausedMs) / 1e3;
}
function hopDuration(fromMidi, toMidi) {
	const from = standPos(fromMidi);
	const to = standPos(toMidi);
	const dist = Math.abs(to.x - from.x);
	if (prefersReduced()) return .12;
	if (toMidi === fromMidi) return .2;
	return Math.min(.55, .16 + dist * .1);
}
function stepListen(s) {
	const song = currentSong();
	if (!song) return;
	const beat = 60 / song.bpm;
	while (s.demoClick < 2 && s.songTime >= s.demoClick * beat - 1e-4) {
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
	if (s.songTime + 1e-4 < startAt) return;
	const remaining = Math.max(.08, onset - s.songTime);
	requestJump(s, next.midi, Math.min(natural, remaining));
}
function requestJump(s, midi, dur, silent = false) {
	if (s.jump) {
		if (useGame.getState().mode === "demo") return;
		s.queued = midi;
		s.queuedSilent = silent;
		return;
	}
	startJump(s, midi, dur, silent);
}
function startJump(s, midi, durOverride, silent = false) {
	const from = standPos(s.midi);
	const to = standPos(midi);
	const dist = Math.abs(to.x - from.x);
	const reduced = prefersReduced();
	const same = midi === s.midi;
	const dur = durOverride ?? (reduced ? .14 : same ? .28 : Math.min(.7, .24 + dist * .12));
	const arc = reduced ? .12 : same ? .36 : Math.min(1.05, .26 + dist * .24);
	s.facing = to.x === from.x ? s.facing : to.x > from.x ? 1 : -1;
	s.anim = dist < .45 ? "hop" : "jump";
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
		kind: dist < .45 ? "hop" : "jump",
		t0: performance.now(),
		pauseT: 0,
		silent
	};
	if (!silent && dur >= .16) piano.whoosh();
}
function stepJump(s, dt, paused, listening = false) {
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
		j.t = (performance.now() - j.t0) / 1e3;
	} else j.t += dt;
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
			startJump(s, q, void 0, qs);
		} else {
			s.queued = null;
			s.queuedSilent = false;
		}
	}
}
function strikeKey(s, midi) {
	s.press.set(midi, 1);
	s.trauma = Math.min(1, s.trauma + .22);
	s.landTick += 1;
	const key = getKey(midi);
	piano.play(midi, .84, stereoPan(key.x));
	judgeKeyboard(s, midi);
}
function judgeKeyboard(s, midi) {
	const st = useGame.getState();
	if (st.screen !== "play" || st.finished || st.mode === "free" || st.mode === "demo") return;
	const song = currentSong();
	if (!song) return;
	const expected = song.notes[st.noteIndex];
	if (!expected || midi !== expected.midi) return;
	let judge = "hit";
	if (st.mode === "recital") {
		const expectedTime = song.notes.slice(0, st.noteIndex).reduce((n, x) => n + x.beats, 0) * (60 / song.bpm);
		const delta = Math.abs(s.songTime - expectedTime);
		judge = delta < .16 ? "perfect" : delta < .34 ? "good" : "ok";
	}
	st.registerHit(judge);
	if (useGame.getState().noteIndex >= song.notes.length) window.setTimeout(() => useGame.getState().finish(), 650);
}
function land(s, midi, silent = false) {
	s.press.set(midi, 1);
	s.trauma = Math.min(1, s.trauma + .28);
	s.landTick += 1;
	if (silent) return;
	const key = getKey(midi);
	const st = useGame.getState();
	const song = st.screen === "play" && !st.finished ? currentSong() : void 0;
	const expected = song?.notes[st.noteIndex];
	const hold = st.mode === "demo" && song ? noteHoldSec(song, st.noteIndex) : void 0;
	piano.play(midi, .84, stereoPan(key.x), hold);
	if (st.screen !== "play" || st.finished || st.mode === "free") return;
	if (!song) return;
	if (!expected) return;
	if (midi === expected.midi) {
		let judge = "hit";
		if (st.mode === "recital") {
			const expectedTime = song.notes.slice(0, st.noteIndex).reduce((n, x) => n + x.beats, 0) * (60 / song.bpm);
			const delta = Math.abs(s.songTime - expectedTime);
			judge = delta < .16 ? "perfect" : delta < .34 ? "good" : "ok";
		}
		st.registerHit(judge);
		if (useGame.getState().noteIndex >= song.notes.length) window.setTimeout(() => useGame.getState().finish(), 650);
	} else if (st.mode === "recital") st.registerMiss();
	else if (st.mode === "learn") st.registerMiss();
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Button({ variant = "primary", className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium tracking-wide transition-[opacity,transform,background-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] enabled:active:scale-[0.98] disabled:opacity-40", variant === "primary" && "bg-accent text-accent-fg hover:opacity-90", variant === "secondary" && "border border-line bg-surface-2 text-fg hover:bg-surface", variant === "ghost" && "text-fg hover:bg-surface-2", variant === "soft" && "bg-fg/10 text-fg hover:bg-fg/16", className),
		...props
	});
}
function Overlays() {
	const screen = useGame((s) => s.screen);
	const settingsOpen = useGame((s) => s.settingsOpen);
	const paused = useGame((s) => s.paused);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10",
		children: [
			screen === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {}),
			screen === "songs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongSelect, {}),
			screen === "howto" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Howto, {}),
			screen === "play" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HUD, {}),
			screen === "play" && paused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseSheet, {}),
			screen === "results" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Results, {}),
			settingsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSheet, {})
		]
	});
}
function Title() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 flex flex-col justify-between px-5 py-6 sm:px-10 sm:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-[0.32em] text-muted",
				children: "Concert for one"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopIcons, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto max-w-xl panel-enter",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.95] tracking-[-0.03em] text-fg",
					children: "Ivory Hopper"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base",
					children: "A tiny maestro on a giant concert piano. Hop the glowing keys in order — Chopsticks, Twinkle, Für Elise — or sit back and listen to each piece in time."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => useGame.getState().goSongs(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Play songs"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => useGame.getState().startFree(),
							children: "Free play"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							onClick: () => useGame.getState().goHowto(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4" }), "How to play"]
						})
					]
				})
			]
		})]
	});
}
function TopIcons() {
	const muted = useGame((s) => s.muted);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto flex items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			className: "min-h-11 min-w-11 px-0",
			"aria-label": muted ? "Unmute" : "Mute",
			onClick: () => useGame.getState().setMuted(!muted),
			children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			className: "min-h-11 min-w-11 px-0",
			"aria-label": "Settings",
			onClick: () => useGame.getState().toggleSettings(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
		})]
	});
}
function SongSelect() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto absolute inset-0 flex flex-col bg-bg/55 px-4 py-5 backdrop-blur-[2px] sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-5xl items-center justify-between gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						className: "px-3",
						onClick: () => useGame.getState().goTitle(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Hall"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl tracking-tight sm:text-4xl",
						children: "The programme"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopIcons, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-5xl text-sm text-muted",
				children: "Learn lights the path. Recital scores your accuracy. Listen plays each piece in time — sit back and watch."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-5 grid w-full max-w-5xl flex-1 grid-cols-1 gap-3 overflow-y-auto pb-6 sm:grid-cols-2 lg:grid-cols-3",
				children: SONGS.map((song) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "flex flex-col rounded-2xl border border-line bg-surface/90 p-4 shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-2xl leading-tight text-fg",
								children: song.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: song.composer
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Difficulty, { n: song.difficulty })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 flex-1 text-sm leading-relaxed text-muted",
							children: song.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between gap-2 text-xs text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								song.notes.length,
								" hops · ",
								Math.round(songDurationSec(song)),
								"s · ",
								song.bpm,
								" BPM"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
									n: starsFor(song.id, "learn"),
									label: "Learn"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
									n: starsFor(song.id, "recital"),
									label: "Recital"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "flex-1",
								onClick: () => useGame.getState().startSong(song.id, "learn"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-4" }), "Learn"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: () => useGame.getState().startSong(song.id, "recital"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4" }), "Recital"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "mt-2 w-full",
							onClick: () => useGame.getState().startSong(song.id, "demo"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "size-4" }), "Listen in time"]
						})
					]
				}, song.id))
			})
		]
	});
}
function Difficulty({ n }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-1 pt-1",
		"aria-label": `Difficulty ${n} of 5`,
		children: Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-3 rounded-full", i < n ? "bg-accent" : "bg-line") }, i))
	});
}
function Stars({ n, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center gap-0.5",
		title: label,
		children: Array.from({ length: 3 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3", i < n ? "fill-accent text-accent" : "text-subtle") }, i))
	});
}
function HUD() {
	const mode = useGame((s) => s.mode);
	const noteIndex = useGame((s) => s.noteIndex);
	const combo = useGame((s) => s.combo);
	const score = useGame((s) => s.score);
	const lastJudge = useGame((s) => s.lastJudge);
	const song = currentSong();
	const total = song?.notes.length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto absolute top-0 right-0 left-0 flex items-start justify-between gap-3 px-3 py-3 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "soft",
					className: "px-3",
					"aria-label": "Programme",
					onClick: () => useGame.getState().goSongs(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Programme"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-bg/55 px-3 py-2 backdrop-blur-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg leading-none text-fg",
							children: song?.title ?? "Free play"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] uppercase tracking-[0.18em] text-muted",
							children: [
								modeLabel(mode),
								mode === "demo" && song ? ` · ${song.bpm} BPM` : "",
								total > 0 ? ` · ${Math.min(noteIndex, total)}/${total}` : ""
							]
						}),
						total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 h-1 w-28 overflow-hidden rounded-full bg-line sm:w-36",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-accent transition-[width] duration-150",
								style: { width: `${Math.min(noteIndex, total) / total * 100}%` }
							})
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					mode !== "free" && mode !== "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden rounded-2xl bg-bg/55 px-3 py-2 text-right backdrop-blur-sm sm:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm tabular-nums text-fg",
							children: score
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.18em] text-muted",
							children: combo > 1 ? `${combo} combo` : "score"
						})]
					}),
					mode !== "free" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "soft",
						className: "min-h-11 min-w-11 px-0",
						"aria-label": "Pause",
						onClick: () => useGame.getState().pause(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopIcons, {})
				]
			})]
		}),
		song && mode !== "free" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute top-24 right-0 left-0 hidden justify-center px-3 sm:flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex max-w-full items-center gap-1 overflow-hidden rounded-full bg-bg/50 px-2 py-1.5 backdrop-blur-sm",
				children: song.notes.slice(noteIndex, noteIndex + 8).map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full px-2 py-0.5 font-display text-sm", i === 0 ? "note-now bg-accent text-accent-fg" : "text-muted"),
					children: noteName(n.midi).replace("#", "♯")
				}, `${n.midi}-${noteIndex + i}`))
			})
		}),
		mode !== "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JudgePop, { judge: lastJudge }),
		mode === "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-xs tracking-wide text-muted sm:block",
			children: "Count-in, then hops land on the beat"
		}),
		mode !== "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPiano, {}),
		mode !== "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {}),
		mode !== "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopHint, {}),
		mode !== "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardGuide, {})
	] });
}
function modeLabel(mode) {
	if (mode === "learn") return "Learn";
	if (mode === "recital") return "Recital";
	if (mode === "demo") return "Listening";
	return "Free play";
}
function JudgePop({ judge }) {
	const [shown, setShown] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!judge) return;
		setShown(judge);
		const t = window.setTimeout(() => setShown(null), 520);
		return () => window.clearTimeout(t);
	}, [judge]);
	if (!shown) return null;
	const label = shown === "perfect" ? "Perfect" : shown === "good" ? "Good" : shown === "ok" ? "Ok" : shown === "miss" ? "Try the glow" : shown === "hit" ? "Yes" : "";
	if (!label) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "judge-pop pointer-events-none absolute top-1/3 left-1/2 font-display text-3xl text-accent",
		children: label
	});
}
function DesktopHint() {
	const mode = useGame((s) => s.mode);
	if (useGame((s) => s.showKeyboard) !== false) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "pointer-events-none absolute bottom-36 left-1/2 hidden -translate-x-1/2 text-xs tracking-wide text-muted sm:block",
		children: mode === "learn" ? "Space hops to the glow · arrows step · two hands on the keys" : "Arrows hop · left ZXCVBNM · right QWERTYUIOP · both hands at once"
	});
}
function KeyboardGuide() {
	const show = useGame((s) => s.showKeyboard !== false && s.screen === "play" && !s.paused);
	const noteIndex = useGame((s) => s.noteIndex);
	const next = currentSong()?.notes[noteIndex]?.midi;
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute bottom-5 left-1/2 hidden w-[min(44rem,calc(100%-1.5rem))] -translate-x-1/2 sm:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 rounded-2xl border border-line bg-bg/70 px-3 py-2 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandCluster, {
				label: "Left · C3–C4",
				blacks: LEFT_BLACK,
				whites: LEFT_WHITE,
				next
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandCluster, {
				label: "Right · C4–G5",
				blacks: RIGHT_BLACK,
				whites: RIGHT_WHITE,
				next
			})]
		})
	});
}
function HandCluster({ label, blacks, whites, next }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mb-0.5 flex h-5 items-end pl-3",
				children: blacks.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mr-0.5 flex h-5 w-5 items-center justify-center rounded-sm text-[9px] font-medium", k.gap && "ml-3", k.midi === next ? "bg-glow text-fg ring-1 ring-accent" : "bg-bg text-muted"),
					children: codeCaption(k.code)
				}, k.code))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex",
				children: whites.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mr-0.5 flex h-6 min-w-6 flex-1 items-center justify-center rounded-sm text-[10px] font-medium", k.midi === next ? "bg-accent text-accent-fg" : "bg-fg/90 text-subtle"),
					children: codeCaption(k.code)
				}, k.code))
			})
		]
	});
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
		if (!song) return {
			lo: 60,
			hi: 72
		};
		const midis = song.notes.map((n) => n.midi);
		const min = Math.min(...midis);
		const max = Math.max(...midis);
		return {
			lo: Math.max(48, min - 2),
			hi: Math.min(84, max + 2)
		};
	})();
	const keys = LAYOUT.filter((k) => k.midi >= range.lo && k.midi <= range.hi);
	const whites = keys.filter((k) => !k.isBlack);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("pointer-events-auto absolute right-0 bottom-16 left-0 flex items-end justify-center gap-2 px-3 sm:bottom-5", showKeyboard && "sm:hidden"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex h-16 max-w-xl flex-1 overflow-hidden rounded-2xl border border-line bg-surface/90 px-1 pt-2 shadow-panel sm:h-20 sm:flex-none sm:w-full",
			children: [whites.map((key) => {
				const glow = key.midi === next;
				const later = key.midi === n1 || key.midi === n2;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": key.name,
					onPointerDown: (e) => {
						e.preventDefault();
						useGame.getState().hopTo(key.midi);
					},
					className: cn("relative flex h-full min-w-6 flex-1 flex-col items-center justify-end rounded-sm border border-line pb-1 text-xs sm:min-w-7", glow ? "bg-glow text-fg ring-2 ring-accent" : later ? "bg-glow/35 text-fg" : "bg-fg text-subtle"),
					children: key.short
				}, key.midi);
			}), keys.filter((k) => k.isBlack).map((key) => {
				const whitesBefore = whites.filter((w) => w.x < key.x).length;
				const glow = key.midi === next;
				const pct = whites.length <= 1 ? 0 : whitesBefore / whites.length * 100;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": key.name,
					onPointerDown: (e) => {
						e.preventDefault();
						useGame.getState().hopTo(key.midi);
					},
					style: { left: `calc(${pct}% - 0.45rem)` },
					className: cn("absolute top-2 h-8 w-4 rounded-sm sm:h-10", glow ? "bg-glow" : "bg-bg")
				}, key.midi);
			})]
		}), mode === "learn" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mb-1 hidden shrink-0 px-4 sm:inline-flex",
			onPointerDown: () => hopTarget(),
			children: "Hop to glow"
		})]
	});
}
function TouchControls() {
	const mode = useGame((s) => s.mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto absolute right-0 bottom-0 left-0 flex items-end justify-between gap-3 px-4 py-4 sm:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-12 min-w-12 px-0",
				"aria-label": "Hop left",
				onPointerDown: () => hopDir(-1),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-12 min-w-12 px-0",
				"aria-label": "Hop right",
				onPointerDown: () => hopDir(1),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5 rotate-180" })
			})]
		}), (mode === "learn" || mode === "free") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "min-h-12 px-6",
			onPointerDown: () => hopTarget(),
			children: mode === "learn" ? "Hop to glow" : "Bounce"
		})]
	});
}
function hopDir(dir) {
	const code = dir < 0 ? "ArrowLeft" : "ArrowRight";
	const ev = new KeyboardEvent("keydown", {
		code,
		bubbles: true
	});
	window.dispatchEvent(ev);
	window.setTimeout(() => {
		window.dispatchEvent(new KeyboardEvent("keyup", {
			code,
			bubbles: true
		}));
	}, 80);
}
function hopTarget() {
	const st = useGame.getState();
	const next = currentSong()?.notes[st.noteIndex];
	if (next) {
		st.hopTo(next.midi);
		return;
	}
	window.dispatchEvent(new KeyboardEvent("keydown", {
		code: "Space",
		bubbles: true
	}));
	window.setTimeout(() => {
		window.dispatchEvent(new KeyboardEvent("keyup", {
			code: "Space",
			bubbles: true
		}));
	}, 80);
}
function PauseSheet() {
	const mode = useGame((s) => s.mode);
	const song = currentSong();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 flex items-center justify-center bg-bg/60 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.28em] text-muted",
					children: "Paused"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-4xl",
					children: song?.title ?? "Free play"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => useGame.getState().pause(false),
							children: "Resume"
						}),
						mode !== "free" && song && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => useGame.getState().startSong(song.id, mode),
							children: "Restart"
						}),
						mode !== "demo" && mode !== "free" && song && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							onClick: () => useGame.getState().startSong(song.id, "demo"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "size-4" }), "Listen in time"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => useGame.getState().goSongs(),
							children: "Programme"
						})
					]
				})
			]
		})
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 flex items-end justify-center bg-bg/40 px-4 py-8 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.28em] text-muted",
					children: "Curtain"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-4xl leading-tight",
					children: song?.title ?? "Free play"
				}),
				mode !== "demo" && mode !== "free" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex gap-1",
					children: Array.from({ length: 3 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-7", i < earned ? "fill-accent text-accent" : "text-subtle") }, i))
				}),
				mode === "demo" && song ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm leading-relaxed text-muted",
					children: [
						"Played in time at ",
						song.bpm,
						" BPM — hops landed on the beat, notes held their true length."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 grid grid-cols-3 gap-3 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Score",
							value: String(score)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Hits",
							value: `${hits}/${total}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Combo",
							value: String(combo)
						})
					]
				}), misses > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-center text-sm text-muted",
					children: [misses, " missed hops"]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						song && mode !== "free" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => useGame.getState().startSong(song.id, mode === "demo" ? "learn" : mode),
							children: mode === "demo" ? "Your turn" : "Play again"
						}),
						song && mode === "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => useGame.getState().startSong(song.id, "demo"),
							children: "Listen again"
						}),
						song && mode === "learn" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => useGame.getState().startSong(song.id, "recital"),
							children: "Recital"
						}),
						song && mode !== "demo" && mode !== "free" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							onClick: () => useGame.getState().startSong(song.id, "demo"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "size-4" }), "Listen in time"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => useGame.getState().goSongs(),
							children: "Programme"
						})
					]
				})
			]
		})
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-surface-2 px-2 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-lg tabular-nums text-fg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] uppercase tracking-[0.16em] text-muted",
			children: label
		})]
	});
}
function Howto() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 flex items-end justify-center bg-bg/50 px-4 py-6 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.28em] text-muted",
					children: "The hall"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-4xl",
					children: "How to hop"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-5 space-y-4 text-sm leading-relaxed text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-fg",
							children: "Tap a key"
						}), " — or hop with the arrows — and the piano speaks. The little maestro lands, the note rings."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-fg",
							children: "Listen"
						}), " plays two count-in ticks, then the piece at its written tempo. Notes ring for their true length. Sit back, then take your turn."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-fg",
							children: "Learn"
						}), " lights the next keys in teal. Space — or Hop to glow — jumps the highlighted note. Wrong keys still play; the glow waits."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-fg",
							children: "Recital"
						}), " scores accuracy and timing. Land the sequence. Stars wait at the curtain."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-fg",
							children: "Two hands"
						}), " — left hand ZXCVBNM (C3–C4) and right QWERTYUIOP (C4–G5), including the black-key numbers. Play both at once for Chopsticks and Heart and Soul. Arrows still hop."] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardLegend, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => useGame.getState().goSongs(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "size-4" }), "Choose a song"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => useGame.getState().goTitle(),
						children: "Back"
					})]
				})
			]
		})
	});
}
function KeyboardLegend() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-2xl border border-line bg-surface-2 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-3.5" }), "Two-hand keyboard"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandCluster, {
				label: "Left · C3–C4",
				blacks: LEFT_BLACK,
				whites: LEFT_WHITE,
				next: void 0
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandCluster, {
				label: "Right · C4–G5",
				blacks: RIGHT_BLACK,
				whites: RIGHT_WHITE,
				next: void 0
			})]
		})]
	});
}
function SettingsSheet() {
	const master = useGame((s) => s.master);
	const muted = useGame((s) => s.muted);
	const shake = useGame((s) => s.shake);
	const showNames = useGame((s) => s.showNames);
	const showKeyboard = useGame((s) => s.showKeyboard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 z-20 flex items-end justify-center bg-bg/55 px-4 py-6 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-panel panel-enter",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "Settings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "px-3",
						onClick: () => useGame.getState().toggleSettings(false),
						children: "Close"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-5 block text-sm text-muted",
					children: ["Volume", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1,
						step: .01,
						value: master,
						onChange: (e) => useGame.getState().setMaster(Number(e.target.value)),
						className: "mt-2 w-full accent-accent"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Mute",
					on: muted,
					onChange: (v) => useGame.getState().setMuted(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Camera shake",
					on: shake,
					onChange: (v) => useGame.getState().setShake(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Note names on keys",
					on: showNames,
					onChange: (v) => useGame.getState().setShowNames(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Keyboard guide",
					on: showKeyboard !== false,
					onChange: (v) => useGame.getState().setShowKeyboard(v)
				})
			]
		})
	});
}
function Toggle({ label, on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onChange(!on),
		className: "mt-3 flex min-h-11 w-full items-center justify-between rounded-2xl bg-surface-2 px-4 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("h-6 w-10 rounded-full p-0.5 transition-colors", on ? "bg-accent" : "bg-line"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block h-5 w-5 rounded-full bg-accent-fg transition-transform", on && "translate-x-4") })
		})]
	});
}
function GameApp() {
	(0, import_react.useEffect)(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
				className: "absolute inset-0 touch-none",
				shadows: true,
				dpr: [1, 1.6],
				camera: {
					position: [
						.35,
						1.85,
						4.85
					],
					fov: 38,
					near: .1,
					far: 42
				},
				gl: {
					antialias: true,
					toneMapping: 4,
					toneMappingExposure: 1.18
				},
				onCreated: ({ gl }) => {
					gl.setClearColor("#0c0b0a");
					gl.shadowMap.enabled = true;
					gl.shadowMap.type = 1;
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: null,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PianoWorld, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 stage-vignette" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlays, {})
		]
	});
}
//#endregion
export { GameApp as default };
