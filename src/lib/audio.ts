import { reportError } from "@/lib/report";

export type Speakable = {
  seq?: string;
  soundUrl: string;
  jeju: string;
};

let current: HTMLAudioElement | null = null;

function pickKoreanVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return voices.find((voice) => voice.lang === "ko-KR") ?? voices.find((voice) => voice.lang.startsWith("ko"));
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
}

function localSrc(word: Speakable): string | null {
  if (word.seq) return `/audio/${word.seq}.mp3`;
  if (word.soundUrl.startsWith("/audio/")) return word.soundUrl;
  const match = word.soundUrl.match(/dialect=(\d+)/);
  if (match) return `/audio/${match[1]}.mp3`;
  if (word.soundUrl.startsWith("/")) return word.soundUrl;
  return null;
}

function getPlayer(): HTMLAudioElement {
  if (current?.isConnected) return current;
  const audio = document.createElement("audio");
  audio.preload = "auto";
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  document.body.appendChild(audio);
  current = audio;
  return audio;
}

export function stopAudio() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (!current) return;
  current.pause();
  current.removeAttribute("src");
  current.load();
}

function playFile(src: string): Promise<void> {
  const audio = getPlayer();
  audio.pause();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("playing", onPlaying);
      if (error) reject(error);
      else resolve();
    };
    const onEnded = () => finish();
    const onError = () => finish(new Error("audio failed"));
    const onPlaying = () => clearTimeout(timer);
    const timer = setTimeout(() => finish(new Error("audio timeout")), 8000);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("playing", onPlaying);
    audio.src = src;
    void audio.play().catch((error) => finish(error instanceof Error ? error : new Error("play failed")));
  });
}

function speakKorean(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.82;
  const voice = pickKoreanVoice();
  if (voice) utterance.voice = voice;
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    utterance.onend = done;
    utterance.onerror = done;
    synth.cancel();
    synth.speak(utterance);
    if (synth.paused) synth.resume();
    window.setTimeout(done, Math.min(4000, 800 + text.length * 350));
  });
}

export async function playWord(word: Speakable): Promise<void> {
  stopAudio();
  const src = localSrc(word);
  let fileError: unknown = null;
  if (src) {
    try {
      await playFile(src);
      return;
    } catch (error) {
      fileError = error;
    }
  }
  const canSpeak = typeof window !== "undefined" && Boolean(window.speechSynthesis) && Boolean(word.jeju);
  if (canSpeak) {
    await speakKorean(word.jeju);
    return;
  }
  if (fileError) {
    reportError(fileError, { seq: word.seq ?? "", src: src ?? "", reason: "audio-and-tts-failed" });
    throw fileError instanceof Error ? fileError : new Error("audio failed");
  }
}

export function playAudio(src: string, speak = ""): Promise<void> {
  return playWord({ soundUrl: src, jeju: speak });
}
