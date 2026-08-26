import { chromium } from "playwright";

const url = "http://127.0.0.1:8080/";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (error) => console.error("pageerror", error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("console", msg.text());
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/qa-home.png", fullPage: true });

const homeText = await page.locator("body").innerText();
if (!homeText.includes("400 단어") || !homeText.includes("40 유닛")) {
  throw new Error(`home missing 400/40: ${homeText.slice(0, 200)}`);
}

await page.getByRole("link", { name: /이어서 배우기/ }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: "/workspace/screenshots/learn-intro.png" });
const intro = await page.locator("body").innerText();
if (!intro.includes("아방") || !intro.includes("아버지")) {
  throw new Error("intro missing first word");
}

await page.getByRole("button", { name: "퀴즈 시작" }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: "/workspace/screenshots/quiz-q1.png" });

let missed = 0;
for (let i = 0; i < 20; i += 1) {
  const choices = page.locator("div.grid.gap-2 > button");
  await choices.first().waitFor({ state: "visible" });
  await choices.nth(0).click();
  await page.waitForTimeout(80);
  const body = await page.locator("body").innerText();
  if (body.includes("결과 보기") === false && !body.includes("다음")) {
    throw new Error(`no next after question ${i + 1}`);
  }
  const last = await page.getByRole("button", { name: /결과 보기/ }).count();
  if (last) {
    await page.getByRole("button", { name: "결과 보기" }).click();
    break;
  }
  await page.getByRole("button", { name: "다음" }).click();
  await page.waitForTimeout(80);
}

await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/quiz-results.png" });
const results = await page.locator("body").innerText();
console.log("results snippet", results.slice(0, 400).replace(/\s+/g, " "));

if (results.includes("오답 카드 복습")) {
  missed = 1;
  await page.getByRole("link", { name: /오답 카드 복습/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/workspace/screenshots/review-card.png" });
  await page.getByRole("button", { name: "뒷면 보기" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/workspace/screenshots/review-flipped.png" });
  const review = await page.locator("body").innerText();
  if (!review.includes("이제 알아요") || !review.includes("아직 몰라요")) {
    throw new Error("flashcard actions missing");
  }
} else {
  console.log("no misses this run — seeding a card");
  await page.evaluate(() => {
    const raw = localStorage.getItem("jeju-mal:v1");
    const parsed = raw ? JSON.parse(raw) : { state: {} };
    parsed.state = parsed.state || {};
    parsed.state.wrongBySeq = {
      702: {
        seq: "702",
        unitId: "family",
        jeju: "아방",
        standard: "아버지",
        soundUrl: "https://www.jeju.go.kr/api/culture/dialect?dialect=702",
        timesMissed: 1,
        addedAt: Date.now(),
      },
    };
    localStorage.setItem("jeju-mal:v1", JSON.stringify(parsed));
  });
  await page.goto("http://127.0.0.1:8080/review", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/workspace/screenshots/review-card.png" });
}

console.log(JSON.stringify({ ok: true, missed }));
await browser.close();
