const pentatonic = [0, 2, 4, 7, 9];

export class PianoEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = false;
  private volume = 0.72;

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume * this.volume;
      this.master.connect(this.ctx.destination);
      this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyGain();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.applyGain();
  }

  private applyGain() {
    if (!this.ctx || !this.master) return;
    const g = this.muted ? 0 : this.volume * this.volume;
    this.master.gain.setTargetAtTime(g, this.ctx.currentTime, 0.03);
  }

  play(midi: number, velocity = 0.82, pan = 0, holdSec?: number) {
    this.unlock();
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const freq = 440 * 2 ** ((midi - 69) / 12);
    const natural = 1.55 + Math.max(0, (70 - midi) / 48);
    const dur = holdSec != null ? Math.max(0.28, holdSec) + 0.2 : natural;
    const sustainEnd = holdSec != null ? Math.max(0.07, holdSec * 0.78) : dur * 0.55;

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);
    const out = ctx.createGain();
    out.connect(panner);
    panner.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800 + velocity * 2400, now);
    filter.frequency.exponentialRampToValueAtTime(700 + midi * 8, now + dur * 0.7);
    filter.connect(out);

    const partials: Array<[number, number, OscillatorType]> = [
      [1, 0.52, "triangle"],
      [2, 0.2, "sine"],
      [3, 0.09, "sine"],
      [4, 0.05, "sine"],
      [5, 0.03, "sine"],
      [6.02, 0.018, "sine"],
    ];
    for (const [mul, gain, type] of partials) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * mul;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * velocity), now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur / Math.sqrt(mul));
      osc.connect(g);
      g.connect(filter);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    }

    if (this.noise) {
      const hammer = ctx.createBufferSource();
      hammer.buffer = this.noise;
      const hg = ctx.createGain();
      hg.gain.setValueAtTime(0.045 * velocity, now);
      hg.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      const hf = ctx.createBiquadFilter();
      hf.type = "bandpass";
      hf.frequency.value = freq * 2.2;
      hf.Q.value = 1.4;
      hammer.connect(hf);
      hf.connect(hg);
      hg.connect(out);
      hammer.start(now);
      hammer.stop(now + 0.05);
    }

    out.gain.setValueAtTime(1, now);
    out.gain.setValueAtTime(1, now + sustainEnd);
    out.gain.exponentialRampToValueAtTime(0.0001, now + dur);
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
    f.frequency.exponentialRampToValueAtTime(1800, now + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(now);
    src.stop(now + 0.2);
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
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.07, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 0.1);
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
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(accent ? 0.065 : 0.04, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + (accent ? 0.09 : 0.06));
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  arpeggio(midis: number[], pan = 0) {
    this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;
    midis.forEach((m, i) => {
      window.setTimeout(() => this.play(m, 0.7, pan), i * 110);
    });
  }

  randomPentatonic() {
    const oct = 4;
    const pc = pentatonic[Math.floor(Math.random() * pentatonic.length)] ?? 0;
    return (oct + 1) * 12 + pc;
  }
}

export const piano = new PianoEngine();

export function resumeOnVisible() {
  if (typeof document === "undefined") return;
  const kick = () => piano.unlock();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") kick();
  });
  window.addEventListener("focus", kick);
}
