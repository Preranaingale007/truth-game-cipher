let ctx: AudioContext | null = null;
let hum: GainNode | null = null;
let muted = false;

export function startAudio() {
  if (typeof window === "undefined") return;
  if (ctx) { ctx.resume(); return; }
  ctx = new AudioContext();
  const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 48;
  const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 72.4;
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 220;
  hum = ctx.createGain(); hum.gain.value = 0;
  o1.connect(f); o2.connect(f); f.connect(hum).connect(ctx.destination);
  o1.start(); o2.start();
  hum.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 5);
}

export function setIntensity(level: number) {
  if (!ctx || !hum) return;
  hum.gain.cancelScheduledValues(ctx.currentTime);
  hum.gain.linearRampToValueAtTime(muted ? 0 : 0.035 + level * 0.018, ctx.currentTime + 0.6);
}

export function toggleMute() {
  muted = !muted;
  setIntensity(1);
  return muted;
}

export function blip(kind: "ok" | "bad" | "tick" | "open") {
  if (!ctx || muted) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime;
  const map = { ok: [660, 990, "sine", 0.4], bad: [140, 90, "square", 0.5], tick: [1200, 1200, "square", 0.05], open: [80, 300, "sawtooth", 1.6] } as const;
  const [a, b, type, d] = map[kind];
  o.type = type; o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(b, t + d);
  g.gain.setValueAtTime(kind === "tick" ? 0.03 : 0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d);
}
