import { reportError } from "@/lib/report";

export type Speakable = {
  seq?: string;
  soundUrl: string;
  jeju: string;
};

let current: HTMLAudioElement | null = null;

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

/** 검증된 로컬 음원이 있을 때만 발음 컨트롤/자동재생을 켠다. */
export function hasVerifiedAudio(word: { hasAudio?: boolean } | undefined): boolean {
  return word?.hasAudio === true;
}

export async function playWord(word: Speakable): Promise<void> {
  stopAudio();
  const src = localSrc(word);
  if (!src) {
    const error = new Error("audio unavailable");
    reportError(error, { seq: word.seq ?? "", src: "", reason: "audio-unavailable" });
    throw error;
  }
  try {
    await playFile(src);
  } catch (error) {
    reportError(error, { seq: word.seq ?? "", src, reason: "audio-failed" });
    throw error instanceof Error ? error : new Error("audio failed");
  }
}

export function playAudio(src: string, _speak = ""): Promise<void> {
  return playWord({ soundUrl: src, jeju: "" });
}
