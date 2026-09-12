import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "vitest";
import { hasVerifiedAudio, playAudio, playWord, stopAudio } from "./audio";

const audioSource = readFileSync(fileURLToPath(new URL("./audio.ts", import.meta.url)), "utf8");

let mode: "ok" | "fail" = "ok";
let playCount = 0;
let lastSrc = "";
let ttsCalls = 0;
let domInstalled = false;

class FakeAudio {
  src = "";
  paused = true;
  isConnected = true;
  preload = "";
  private listeners = new Map<string, Set<() => void>>();
  setAttribute() {}
  removeAttribute() {
    this.src = "";
  }
  addEventListener(type: string, fn: () => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(fn);
    this.listeners.set(type, set);
  }
  removeEventListener(type: string, fn: () => void) {
    this.listeners.get(type)?.delete(fn);
  }
  private emit(type: string) {
    for (const fn of this.listeners.get(type) ?? []) fn();
  }
  pause() {
    this.paused = true;
  }
  load() {}
  play() {
    playCount += 1;
    lastSrc = this.src;
    if (mode === "fail") return Promise.reject(new Error("play failed"));
    queueMicrotask(() => {
      this.emit("playing");
      this.emit("ended");
    });
    return Promise.resolve();
  }
}

function installDom() {
  playCount = 0;
  lastSrc = "";
  ttsCalls = 0;
  if (domInstalled) return;
  domInstalled = true;
  const document = {
    createElement: (tag: string) => {
      if (tag !== "audio") throw new Error(`unexpected element ${tag}`);
      return new FakeAudio();
    },
    body: { appendChild() {} },
  };
  Object.defineProperty(globalThis, "document", { value: document, configurable: true });
  Object.defineProperty(globalThis, "window", {
    value: {
      speechSynthesis: {
        speak() {
          ttsCalls += 1;
        },
        cancel() {},
        getVoices() {
          return [];
        },
      },
    },
    configurable: true,
  });
}

test("audio.ts has no generic Korean TTS fallback", () => {
  assert.equal(/speechSynthesis/.test(audioSource), false);
  assert.equal(/SpeechSynthesisUtterance/.test(audioSource), false);
  assert.equal(/speakKorean/.test(audioSource), false);
  assert.equal(/pickKoreanVoice/.test(audioSource), false);
});

test("hasVerifiedAudio is true only for hasAudio === true", () => {
  assert.equal(hasVerifiedAudio({ hasAudio: true }), true);
  assert.equal(hasVerifiedAudio({ hasAudio: false }), false);
  assert.equal(hasVerifiedAudio({}), false);
  assert.equal(hasVerifiedAudio(undefined), false);
});

test("playWord plays the local file and never calls TTS", async () => {
  installDom();
  mode = "ok";
  await playWord({ seq: "1", soundUrl: "/audio/1.mp3", jeju: "느" });
  assert.equal(playCount, 1);
  assert.equal(lastSrc, "/audio/1.mp3");
  assert.equal(ttsCalls, 0);
  stopAudio();
});

test("playWord throws on file failure without TTS", async () => {
  installDom();
  mode = "fail";
  await assert.rejects(() => playWord({ seq: "1", soundUrl: "/audio/1.mp3", jeju: "느" }));
  assert.equal(playCount, 1);
  assert.equal(ttsCalls, 0);
  stopAudio();
});

test("playAudio keeps the life-dialect file playback path", async () => {
  installDom();
  mode = "ok";
  await playAudio("/audio/life-dialect/1.mp3");
  assert.equal(playCount, 1);
  assert.equal(lastSrc, "/audio/life-dialect/1.mp3");
  assert.equal(ttsCalls, 0);
  stopAudio();
});
