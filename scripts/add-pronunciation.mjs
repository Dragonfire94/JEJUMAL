#!/usr/bin/env node
// 옛한글(아래아) 발음 안내 + PUA 자모 복원 (2026-09-28 승인).
//
// 1. content/lexemes.json의 PUA 문자를 자모로 복원한다.
//    - 14종: data/jeju-basic-vocab-2025/pua-glyph-mapping.json (medium 이상)
//    - 7종: 원전 PDF(source.pdf) 직접 판독 — E566=ᄆᆞᆯ, EE88=ᄋᆞ,
//      F3EA/F3EE=ᄏᆞᆯ, F43F=ᄃᆞᆮ, E3EA=ᄄᆞᆺ, F20D=ᄌᆞᆾ
//    - 복원 후 containsPua 플래그 제거 (화면에 깨지는 문자 없음)
// 2. 아래아(ᆞ)/쌍아래아(ᆢ) 포함 단어에 pronunciation(읽는 법) 필드를 붙인다.
//    - ᆞ → ㅓ, ᆢ → ㅕ, ᆞᆞ → ㅓ (예: ᄒᆞ나→허나, ᄋᆢ섯→여섯)
//    - 동형이의어 번호(末尾 숫자)는 발음에서 제외
//
//   node scripts/add-pronunciation.mjs
//
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LEXEMES_PATH = path.join(ROOT, "content/lexemes.json");
const AUDIT_PATH = path.join(ROOT, "data/pua-pronunciation-2026-09-28.json");

// PUA → 자모 (읽는 법). conf: high=PDF 직접 확인, medium=기존 매핑 검증됨, low=추정
const PUA_TABLE = {
  E1AA: { jamo: "ᄀᆞᆫ", conf: "medium", src: "pua-glyph-mapping.json" },
  E1AD: { jamo: "ᄀᆞᆯ", conf: "medium", src: "pua-glyph-mapping.json" },
  E1BA: { jamo: "ᄀᆞᆷ", conf: "medium", src: "pua-glyph-mapping.json" },
  E1BF: { jamo: "ᄀᆞᆺ", conf: "medium", src: "pua-glyph-mapping.json" },
  E1C6: { jamo: "ᄀᆞᆺ", conf: "medium", src: "pua-glyph-mapping.json" },
  E202: { jamo: "ᄁᆞᆨ", conf: "medium", src: "pua-glyph-mapping.json" },
  E291: { jamo: "ᄂᆞᆸ", conf: "medium", src: "pua-glyph-mapping.json" },
  E397: { jamo: "ᄃᆞᆷ", conf: "medium", src: "pua-glyph-mapping.json" },
  E39E: { jamo: "ᄃᆞᆺ", conf: "medium", src: "pua-glyph-mapping.json" },
  E3A4: { jamo: "ᄃᆞᆼ", conf: "medium", src: "pua-glyph-mapping.json" },
  E566: { jamo: "ᄆᆞᆯ", conf: "high", src: "PDF 직접 판독 (말 표제어)" },
  E98B: { jamo: "ᄉᆞᆷ", conf: "medium", src: "pua-glyph-mapping.json" },
  EE88: { jamo: "ᄋᆞ", conf: "high", src: "PDF 직접 판독 (종성 없음 확인)" },
  F343: { jamo: "ᄍᆞᆫ", conf: "medium", src: "pua-glyph-mapping.json" },
  F3EB: { jamo: "ᄏᆞᆨ", conf: "medium", src: "pua-glyph-mapping.json" },
  F43C: { jamo: "ᄐᆞᆫ", conf: "medium", src: "pua-glyph-mapping.json" },
  E3EA: { jamo: "ᄄᆞᆺ", conf: "medium", src: "PDF 맥락 + 음운 논리 (따뜻→떠떧)" },
  F20D: { jamo: "ᄌᆞᆾ", conf: "low", src: "PDF 부분 판독 (종성 ㅅ/ㅈ 불확실)" },
  F3EA: { jamo: "ᄏᆞᆯ", conf: "medium", src: "PDF 직접 판독 (ㅋ+ㆍ, 종성 ㄹ)" },
  F3EE: { jamo: "ᄏᆞᆯ", conf: "medium", src: "PDF 직접 판독 (F3EA와 동일 렌더링)" },
  F43F: { jamo: "ᄃᆞᆮ", conf: "medium", src: "PDF 직접 판독 (초성 ㄷ≠ㅌ 확인, 뜯다→덛다)" },
};

const JUNG_ARAEA = 0x119e;
const JUNG_SSANG_ARAEA = 0x11a2;
const JUNG_EO = 0x1165; // ㅓ
const JUNG_YEO = 0x1167; // ㅕ

const isCho = (o) => o >= 0x1100 && o <= 0x1112;
const isJung = (o) => o >= 0x1160 && o <= 0x11a7;
const isJong = (o) => o >= 0x11a8 && o <= 0x11d7;
const isPrecomposed = (o) => o >= 0xac00 && o <= 0xd7a3;

function compose(choO, jungO, jongO) {
  const ci = choO - 0x1100;
  const ji = jungO - 0x1161;
  const ki = jongO ? jongO - 0x11a7 : 0;
  return String.fromCodePoint(0xac00 + (ci * 21 + ji) * 28 + ki);
}

/** 자모+완성형 혼합 문자열을 "읽는 법"(완성형 한글)으로 바꾼다. */
export function toPronunciation(s) {
  // 동형이의어 번호(末尾 숫자/윗첨자) 제거
  const src = s.replace(/[0-9¹²³⁴]+$/, "");
  const chars = [...src];
  let out = "";
  let i = 0;
  while (i < chars.length) {
    const o = chars[i].codePointAt(0);
    if (isCho(o)) {
      const choO = o;
      i++;
      let jungO = null;
      if (i < chars.length && isJung(chars[i].codePointAt(0))) {
        jungO = chars[i].codePointAt(0);
        i++;
      }
      // ᆞᆞ 이중 아래아 → 하나로 취급
      if (jungO === JUNG_ARAEA && i < chars.length && chars[i].codePointAt(0) === JUNG_ARAEA) {
        i++;
      }
      let jongO = null;
      if (i < chars.length && isJong(chars[i].codePointAt(0))) {
        jongO = chars[i].codePointAt(0);
        i++;
      }
      if (jungO === null) {
        out += chars[i - 1] ?? "";
        continue;
      }
      let pj = jungO;
      if (jungO === JUNG_ARAEA) pj = JUNG_EO;
      else if (jungO === JUNG_SSANG_ARAEA) pj = JUNG_YEO;
      out += compose(choO, pj, jongO);
    } else if (isPrecomposed(o)) {
      out += chars[i];
      i++;
    } else {
      out += chars[i];
      i++;
    }
  }
  return out;
}

export function restorePua(s) {
  let out = "";
  const used = [];
  for (const ch of s) {
    const o = ch.codePointAt(0);
    if (o >= 0xe000 && o <= 0xf8ff) {
      const key = o.toString(16).toUpperCase();
      const entry = PUA_TABLE[key];
      if (!entry) throw new Error(`매핑 없는 PUA: U+${key} (문자열: ${s})`);
      out += entry.jamo;
      used.push({ pua: `U+${key}`, jamo: entry.jamo, conf: entry.conf });
    } else {
      out += ch;
    }
  }
  return { text: out, used };
}

const hasAraea = (s) => [...s].some((c) => {
  const o = c.codePointAt(0);
  return o === JUNG_ARAEA || o === JUNG_SSANG_ARAEA;
});

function main() {
  const lexemes = JSON.parse(readFileSync(LEXEMES_PATH, "utf8"));
  const audit = { restored: [], pronounced: 0, date: "2026-09-28" };

  for (const lex of lexemes) {
    // 1. PUA 복원 (jeju, standard)
    for (const field of ["jeju", "standard"]) {
      const v = lex[field];
      if (typeof v === "string" && [...v].some((c) => {
        const o = c.codePointAt(0);
        return o >= 0xe000 && o <= 0xf8ff;
      })) {
        const { text, used } = restorePua(v);
        audit.restored.push({ seq: lex.seq, field, before: v, after: text, pua: used });
        lex[field] = text;
      }
    }
    if (lex.containsPua) delete lex.containsPua;

    // 2. 발음 생성
    if (hasAraea(lex.jeju)) {
      lex.pronunciation = toPronunciation(lex.jeju);
      audit.pronounced++;
    } else if (lex.pronunciation) {
      delete lex.pronunciation;
    }
  }

  writeFileSync(LEXEMES_PATH, JSON.stringify(lexemes, null, 2) + "\n", "utf8");
  writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2) + "\n", "utf8");
  console.log(`복원: ${audit.restored.length}건, 발음 추가: ${audit.pronounced}개`);
}

main();
