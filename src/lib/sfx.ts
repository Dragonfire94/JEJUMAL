let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.08,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export type SfxKind = "correct" | "wrong" | "fanfare";

export function playSfx(kind: SfxKind) {
  const context = getCtx();
  if (!context) return;
  const t = context.currentTime + 0.01;
  if (kind === "correct") {
    tone(context, 880, t, 0.12, "sine", 0.07);
    tone(context, 1319, t + 0.11, 0.2, "sine", 0.08);
    return;
  }
  if (kind === "wrong") {
    tone(context, 196, t, 0.18, "triangle", 0.07);
    tone(context, 147, t + 0.1, 0.28, "triangle", 0.06);
    return;
  }
  tone(context, 523, t, 0.14, "sine", 0.07);
  tone(context, 659, t + 0.13, 0.14, "sine", 0.07);
  tone(context, 784, t + 0.26, 0.16, "sine", 0.08);
  tone(context, 1046, t + 0.4, 0.42, "sine", 0.09);
}
