#!/usr/bin/env node
// 3C-1.2: 71개 후보의 사용 근거(의미 앵커 기반)와 의미 중복 전수 검토를 재현한다.
// production content는 수정하지 않는다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const HOMOGRAPH_STRIP = /[0-9¹²³⁴⁵⁶⁷⁸⁹⁰-]+$/u;
const MAX_NOUN_SUFFIX_LEN = 3;
const MAX_VERB_SUFFIX_LEN = 6;

export const stripHomograph = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(HOMOGRAPH_STRIP, "");

export const normalizeTerm = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, "")
    .replace(/[.()]/g, "")
    .trim();

export function mappingMatches(anchor, mapping, verbLike = false) {
  const a = normalizeTerm(anchor);
  const s = normalizeTerm(mapping);
  if (!a || !s) return false;
  if (s === a) return true;
  if (a.length <= 1 || s.length <= 1) return s === a;
  if (s.startsWith(a)) return true;
  if (verbLike && a.endsWith("다") && a.length > 2) {
    const stem = a.slice(0, -1);
    if (stem.length >= 2 && s.startsWith(stem)) return true;
  }
  if (a.endsWith("수있다") && a.length > 4 && s.startsWith(a.slice(0, -2))) return true;
  return false;
}

export function usageTier({ meaningMatched = 0, lifeVerified = 0 } = {}) {
  if (meaningMatched >= 20 || lifeVerified >= 2) return "STRONG";
  if (meaningMatched >= 5 || lifeVerified >= 1) return "MEDIUM";
  if (meaningMatched >= 1) return "WEAK";
  return "NONE";
}

const AXIS = { HIGH: 25, MEDIUM: 14, LOW: 5, NONE: 0 };
const EVIDENCE = { STRONG: 35, MEDIUM: 22, WEAK: 10, NONE: 0 };

const PREV_3C1 = {
  CORE_ADD: ["삼춘", "그추룩", "이추룩", "저추룩", "봅서", "나냥으로", "요자기", "맛좋다"],
  CULTURE_ADD: [
    "돌담", "빙떡", "숨비소리", "오름", "올레", "가문잔치", "곶자왈", "망사리", "물소중의",
    "물수건", "물적삼", "ᄆᆞᆷ국", "반지기밥", "불턱", "빗창", "산담", "신구간", "오메기떡",
    "오분자기", "웃드르", "정주석", "족은눈", "ᄎᆞᆯ레", "큰눈", "테왁",
  ],
  DO_NOT_ADD: [
    "말젯ᄄᆞᆯ", "말젯아덜", "말젯아방", "말젯어멍", "셋ᄄᆞᆯ", "셋아덜", "설남은",
    "조고만ᄒᆞ다", "쪼끌락ᄒᆞ다", "매기독닥",
  ],
};
const PREV_3C11_CORE = ["삼춘", "그추룩", "이추룩", "저추룩", "봅서", "나냥으로", "요자기"];

function previousDecision(form, table) {
  for (const [decision, forms] of Object.entries(table)) {
    if (forms.includes(form)) return decision;
  }
  return "HOLD";
}

const EXTERNAL = {
  오름: ["https://www.jeju.go.kr/is/oreum/info/jejuoreum/list.wp?menuId=MENU000000000000261"],
  올레: ["https://agri.jeju.go.kr/files/board/045-03-1.pdf"],
  빙떡: ["https://www.jeju.go.kr/jedu/data/data.htm?act=view&page=118&seq=1538402"],
  테왁: ["https://www.jeju.go.kr/jori/reference/report.htm?act=download&no=1&page=3&seq=1479413"],
  불턱: ["https://agri.jeju.go.kr/files/board/%EB%8F%84%EC%A0%95%EB%B0%B1%EC%84%9C%202013-2014.pdf"],
  망사리: ["https://agri.jeju.go.kr/files/board/%EB%8F%84%EC%A0%95%EB%B0%B1%EC%84%9C%202013-2014.pdf"],
};

function culture(linguisticType, extra = {}) {
  return {
    kind: "culture",
    decision: "CULTURE_ADD",
    everydayUtility: "LOW",
    culturalImportance: "HIGH",
    redundancy: "NONE",
    linguisticType,
    ...extra,
  };
}

function hold(extra = {}) {
  return {
    kind: "hold",
    decision: "HOLD",
    everydayUtility: extra.everydayUtility ?? "MEDIUM",
    culturalImportance: extra.culturalImportance ?? "LOW",
    redundancy: extra.redundancy ?? "LOW",
    ...extra,
  };
}

function core(extra = {}) {
  return {
    kind: "core",
    decision: "CORE_ADD",
    everydayUtility: "HIGH",
    culturalImportance: extra.culturalImportance ?? "LOW",
    redundancy: extra.redundancy ?? "NONE",
    ...extra,
  };
}

function drop(extra = {}) {
  return {
    kind: "doNotAdd",
    decision: "DO_NOT_ADD",
    everydayUtility: extra.everydayUtility ?? "LOW",
    culturalImportance: extra.culturalImportance ?? "LOW",
    redundancy: extra.redundancy ?? "LOW",
    ...extra,
  };
}

/**
 * 71개 전항의 의미 앵커·중복 판정 오버라이드·최종 decision 원장.
 * JSON에 숨기지 않고 이 테이블이 재현 기준이다.
 */
export const CATALOG = {
  돌담: {
    ...culture("BOTH"),
    meaningTerms: ["돌담"],
    meaningSource: "2025 definition; 표준어 대응 없음",
    meaningNote: "제주 돌담 문화 개념과 방언 형태를 함께 담는다.",
    extraSearchTerms: ["돌담"],
    decisionNote: "제주 주거·경계를 설명하는 문화 학습어로 검토한다.",
  },
  말젯ᄄᆞᆯ: {
    ...drop(),
    meaningTerms: ["셋째 딸", "셋째딸"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["딸"],
    alwaysReviewSeqs: ["90033", "90087", "90096"],
    overrides: {
      90033: { result: "DIFFERENT", reason: "기존 ᄄᆞᆯ은 딸 일반명이고, 말젯딸은 넷 중 셋째라는 서열 한정이다." },
      90087: { result: "DIFFERENT", reason: "족은딸은 막내딸이며 셋째 딸과 서열이 다르다." },
      90096: { result: "DIFFERENT", reason: "큰딸은 첫째 딸이며 셋째 딸과 서열이 다르다." },
    },
    decisionNote: "넷인 딸 가운데 셋째라는 매우 좁은 친족 서열어라 현 핵심 슬롯 우선순위가 낮다.",
  },
  말젯아덜: {
    ...drop(),
    meaningTerms: ["셋째 아들", "셋째아들"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["아들"],
    alwaysReviewSeqs: ["90070", "90088", "90097"],
    overrides: {
      90070: { result: "DIFFERENT", reason: "기존 아덜은 아들 일반명이고, 말젯아덜은 넷 중 셋째라는 서열 한정이다." },
      90088: { result: "DIFFERENT", reason: "족은아덜은 막내아들이며 셋째 아들과 서열이 다르다." },
      90097: { result: "DIFFERENT", reason: "큰아덜은 첫째 아들이며 셋째 아들과 서열이 다르다." },
    },
    decisionNote: "넷인 아들 가운데 셋째라는 매우 좁은 친족 서열어라 현 핵심 슬롯 우선순위가 낮다.",
  },
  말젯아방: {
    ...drop(),
    meaningTerms: ["셋째 삼촌", "셋째아방", "셋째삼촌"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["삼촌", "아저씨"],
    alwaysReviewSeqs: ["705"],
    overrides: {
      705: { result: "DIFFERENT", reason: "아주방은 아저씨 호칭이고, 말젯아방은 아버지 남자 형제 넷 중 셋째라는 서열 한정이다." },
    },
    decisionNote: "친족 서열을 세분하는 항목으로 초급 핵심 슬롯 우선순위가 낮다.",
  },
  말젯어멍: {
    ...drop(),
    meaningTerms: ["셋째 숙모", "셋째숙모"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["숙모"],
    alwaysReviewSeqs: ["2761"],
    overrides: {
      2761: { result: "DIFFERENT", reason: "족은어멍은 숙모 일반이고, 말젯어멍은 셋째 삼촌의 아내라는 서열 한정이다." },
    },
    decisionNote: "친족 서열을 세분하는 항목으로 초급 핵심 슬롯 우선순위가 낮다.",
  },
  빙떡: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["빙떡"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["빙떡", "메밀"],
    decisionNote: "메밀·무채로 만든 제주 음식 문화어로 검토한다.",
  },
  삼춘: {
    ...core({ culturalImportance: "MEDIUM" }),
    meaningTerms: ["삼촌", "아저씨", "어르신"],
    meaningSource: "2025 definition 1) 삼촌 2) 연장자 호칭 + dictionary/AI Hub 삼촌·아저씨 mapping",
    meaningNote: "할머니/이모/형님 mapping은 의미 불일치로 거부한다.",
    rejectTerms: ["할머니", "이모", "형님"],
    extraSearchTerms: ["삼촌", "아저씨"],
    alwaysReviewSeqs: ["705"],
    overrides: {
      705: {
        result: "DIFFERENT",
        reason: "아주방은 아저씨 전용 호칭이다. 삼춘은 삼촌 친족과 연장자 호칭을 함께 쓰므로 같은 학습 슬롯이 아니다.",
      },
    },
    decisionNote: "친족어이면서 연장자 호칭으로도 쓰여 초급 상호작용의 핵심 슬롯이다. 아주방과 부분 겹침은 있으나 같은 개념이 아니다.",
  },
  셋ᄄᆞᆯ: {
    ...drop(),
    meaningTerms: ["둘째 딸", "둘째딸"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["딸"],
    alwaysReviewSeqs: ["90033", "90087", "90096"],
    overrides: {
      90033: { result: "DIFFERENT", reason: "기존 ᄄᆞᆯ은 딸 일반명이고, 셋딸은 둘째 딸이라는 서열 한정이다." },
      90087: { result: "DIFFERENT", reason: "족은딸은 막내딸이며 둘째 딸과 서열이 다르다." },
      90096: { result: "DIFFERENT", reason: "큰딸은 첫째 딸이며 둘째 딸과 서열이 다르다." },
    },
    decisionNote: "둘째 딸을 특정하는 서열어라 일반 친족어보다 우선순위가 낮다.",
  },
  셋아덜: {
    ...drop(),
    meaningTerms: ["둘째 아들", "둘째아들"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["아들"],
    alwaysReviewSeqs: ["90070", "90088", "90097"],
    overrides: {
      90070: { result: "DIFFERENT", reason: "기존 아덜은 아들 일반명이고, 셋아덜은 둘째 아들이라는 서열 한정이다." },
      90088: { result: "DIFFERENT", reason: "족은아덜은 막내아들이며 둘째 아들과 서열이 다르다." },
      90097: { result: "DIFFERENT", reason: "큰아덜은 첫째 아들이며 둘째 아들과 서열이 다르다." },
    },
    decisionNote: "둘째 아들을 특정하는 서열어라 일반 친족어보다 우선순위가 낮다.",
  },
  숨비소리: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["숨비소리", "해녀소리"],
    meaningSource: "2025 definition + AI Hub 해녀소리 mapping",
    extraSearchTerms: ["숨비소리", "물질"],
    alwaysReviewSeqs: ["5009"],
    overrides: {
      5009: { result: "DIFFERENT", reason: "물질은 해녀 작업 일반명이고, 숨비소리는 잠수 후 내쉬는 소리라는 별도 문화어이다." },
    },
    decisionNote: "해녀 물질의 호흡 소리를 가리키는 문화어로 검토한다.",
  },
  오름: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["오름", "봉우리", "산봉우리", "화산"],
    meaningSource: "2025 definition + AI Hub 봉우리류 mapping",
    meaningNote: "산/한 같은 과일반 mapping은 거부한다.",
    rejectTerms: ["산", "한"],
    extraSearchTerms: ["오름", "화산"],
    decisionNote: "제주 화산체 지형 문화어로 검토한다.",
  },
  올레: {
    ...culture("BOTH"),
    meaningTerms: ["올레", "집진입로", "진입로", "집앞길"],
    meaningSource: "2025 definition + AI Hub 집진입로류 mapping",
    meaningNote: "길/거리처럼 과일반 mapping은 거부한다.",
    rejectTerms: ["길", "거리"],
    extraSearchTerms: ["올레"],
    decisionNote: "집으로 드는 좁은 길이라는 방언 형태이자 제주 문화 경관어로 검토한다.",
  },
  먹어지다: {
    ...hold({ everydayUtility: "MEDIUM" }),
    meaningTerms: ["먹게 되다", "먹을 수 있다", "먹어지다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["먹다", "먹이다"],
    alwaysReviewSeqs: ["90507"],
    overrides: {
      90507: { result: "DIFFERENT", reason: "멕이다는 먹이다(사동)이고, 먹어지다는 먹게 되다/가능 표현이다." },
    },
    decisionNote: "가능·피동형 생활 동사로 효용은 있으나, 기본 동사 슬롯과 파생 관계를 더 본 뒤 반영 여부를 정한다.",
  },
  살아지다: {
    ...hold({ everydayUtility: "MEDIUM" }),
    meaningTerms: ["살게 되다", "살 수 있다", "살아지다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["살다"],
    decisionNote: "가능·피동형 생활 동사로 효용은 있으나, 기본 동사 슬롯과 파생 관계를 더 본 뒤 반영 여부를 정한다.",
  },
  알아지다: {
    ...hold({ everydayUtility: "MEDIUM" }),
    meaningTerms: ["알게 되다", "알 수 있다", "알아지다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["알다"],
    decisionNote: "가능·피동형 생활 동사로 효용은 있으나, 기본 동사 슬롯과 파생 관계를 더 본 뒤 반영 여부를 정한다.",
  },
  맛좋다: {
    ...hold({ everydayUtility: "HIGH", redundancy: "HIGH" }),
    meaningTerms: ["맛있다"],
    meaningSource: "2025 definition ‘음식의 맛이 좋다’ + AI Hub 맛있다 mapping",
    extraSearchTerms: ["맛있다"],
    alwaysReviewSeqs: ["90237"],
    overrides: {
      90237: { result: "SAME_CONCEPT", reason: "기존 맛싯다(맛있다)의 책 뜻풀이가 ‘음식의 맛이 좋다’로 동일하다." },
    },
    decisionNote: "음식 평가에는 유용하지만 기존 맛싯다와 같은 개념을 가르칠 위험이 있어 별도 반영 전에 보류한다.",
  },
  그추룩: {
    ...hold({ everydayUtility: "HIGH", redundancy: "HIGH" }),
    meaningTerms: ["그렇게", "그처럼", "그만큼"],
    meaningSource: "2025 definition + AI Hub 그렇게 mapping + 사전 그록/경",
    extraSearchTerms: ["그렇게"],
    alwaysReviewSeqs: ["7357", "7364"],
    overrides: {
      7357: { result: "SAME_CONCEPT", reason: "기존 경(그렇게)이 같은 지시 부사 학습 개념을 이미 다룬다." },
      7364: { result: "DIFFERENT", reason: "그마니는 정도(그만큼) 전용이고, 그추룩은 방식·상태 지시(그렇게)가 중심이다." },
    },
    decisionNote: "지시 부사로서 생활 효용은 높으나, 현재 앱의 경/그렇게와 같은 개념이라 추가 전에 표기 정책을 정해야 한다.",
  },
  이추룩: {
    ...hold({ everydayUtility: "HIGH", redundancy: "HIGH" }),
    meaningTerms: ["이렇게", "이처럼", "이만큼"],
    meaningSource: "2025 definition + AI Hub 이렇게 mapping + 사전 영",
    extraSearchTerms: ["이렇게"],
    alwaysReviewSeqs: ["7463"],
    overrides: {
      7463: { result: "SAME_CONCEPT", reason: "기존 영(이렇게)이 같은 지시 부사 학습 개념을 이미 다룬다." },
    },
    decisionNote: "지시 부사로서 생활 효용은 높으나, 현재 앱의 영/이렇게와 같은 개념이라 추가 전에 표기 정책을 정해야 한다.",
  },
  저추룩: {
    ...hold({ everydayUtility: "HIGH", redundancy: "HIGH" }),
    meaningTerms: ["저렇게", "저처럼", "저만큼"],
    meaningSource: "2025 definition + AI Hub 저렇게 mapping",
    extraSearchTerms: ["저렇게"],
    alwaysReviewSeqs: ["90299"],
    overrides: {
      90299: { result: "SAME_CONCEPT", reason: "기존 졍(저렇게)이 같은 지시 부사 학습 개념을 이미 다룬다." },
    },
    decisionNote: "지시 부사로서 생활 효용은 높으나, 현재 앱의 졍/저렇게와 같은 개념이라 추가 전에 표기 정책을 정해야 한다.",
  },
  가문잔치: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["가문잔치", "본식전일잔치", "본식전날잔치"],
    meaningSource: "2025 definition + AI Hub 본식전일잔치류 mapping",
    extraSearchTerms: ["가문잔치", "잔치"],
    decisionNote: "혼례 전날 친족 잔치라는 제주 의례 문화어로 검토한다.",
  },
  곶자왈: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["곶자왈", "숲덤불"],
    meaningSource: "2025 definition",
    meaningNote: "숲처럼 과일반 mapping은 모호로 둔다.",
    extraSearchTerms: ["곶자왈"],
    decisionNote: "제주 특유의 수풀 지형 문화어로 검토한다.",
  },
  그루후제: {
    ...hold({ everydayUtility: "MEDIUM" }),
    meaningTerms: ["그 이후", "그 후로", "그 후에", "그후에", "그 이후로", "그 이후에"],
    meaningSource: "2025 definition + AI Hub 그 후에류 mapping",
    extraSearchTerms: ["이후"],
    decisionNote: "시간 명사로 쓰임은 확인되나 초급 핵심 슬롯인지는 추가 검토가 필요하다.",
  },
  망사리: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["망사리"],
    meaningSource: "2025 definition",
    meaningNote: "망사는 일반 망사 뜻으로 모호 처리한다.",
    extraSearchTerms: ["망사리"],
    decisionNote: "해녀 채취물 그물이라는 문화어로 검토한다.",
  },
  물소중의: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["물소중의"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["물소중의"],
    decisionNote: "해녀 물질 옷 문화어로 검토한다.",
  },
  물수건: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["물수건"],
    meaningSource: "2025 definition + dictionary 물-수건",
    extraSearchTerms: ["물수건"],
    decisionNote: "해녀 작업 수건 문화어로 검토한다.",
  },
  물적삼: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["물적삼"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["물적삼"],
    decisionNote: "해녀 잠수 적삼 문화어로 검토한다.",
  },
  // 3C-3B.2: PUA U+E56E → ᄆᆞᆷ 매핑 적용 후 원장 표기가 이 형태로
  // 정정됨(구 표기는 실제로 U+E56E+국 2-codepoint였다). 키만 바꾸고
  // 내용(meaningTerms/decisionNote 등)은 그대로 둔다.
  "ᄆᆞᆷ국": {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["모자반국", "ᄆᆞᆷ국"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["모자반"],
    decisionNote: "모자반 돼지고기 국이라는 제주 음식 문화어로 검토한다.",
  },
  반지기밥: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["반지기밥"],
    meaningSource: "2025 definition + dictionary 반지기-밥",
    extraSearchTerms: ["반지기밥"],
    decisionNote: "보리·쌀을 반씩 섞은 밥이라는 제주 음식 문화어로 검토한다.",
  },
  불턱: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["불턱"],
    meaningSource: "2025 definition + dictionary 불-턱",
    extraSearchTerms: ["불턱"],
    decisionNote: "해녀가 몸을 녹이는 장소 문화어로 검토한다.",
  },
  빗창: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["빗창"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["빗창"],
    decisionNote: "해녀 전복 채취 도구 문화어로 검토한다.",
  },
  산담: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["산담"],
    meaningSource: "2025 definition",
    meaningNote: "사성 mapping은 의미 불일치로 거부한다.",
    rejectTerms: ["사성"],
    extraSearchTerms: ["산담", "돌담"],
    decisionNote: "무덤 둘레 돌담이라는 제주 장묘 문화어로 검토한다.",
  },
  신구간: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["신구간"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["신구간"],
    decisionNote: "제주 이사 시기 관념 문화어로 검토한다.",
  },
  오메기떡: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["오메기떡"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["오메기떡"],
    decisionNote: "차조로 만드는 제주 떡 문화어로 검토한다.",
  },
  오분자기: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["오분자기", "떡조개"],
    meaningSource: "2025 definition + AI Hub 떡조개 mapping",
    extraSearchTerms: ["오분자기", "떡조개", "전복"],
    decisionNote: "난대성 전복류를 가리키는 제주 해양 문화어로 검토한다.",
  },
  웃드르: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["웃드르", "한라산쪽", "중산간", "윗동네", "윗마을"],
    meaningSource: "2025 definition + dictionary 웃-드르 + AI Hub 한라산쪽류 mapping",
    rejectTerms: ["육지에"],
    extraSearchTerms: ["웃드르", "중산간"],
    decisionNote: "한라산 쪽 들·마을을 가리키는 지리 문화어로 검토한다.",
  },
  절: {
    ...hold({ everydayUtility: "MEDIUM", redundancy: "NONE" }),
    meaningTerms: ["파도", "물결"],
    meaningSource: "2025 standard 파도 + definition ‘바다에 이는 물결’ + AI Hub 파도 mapping + 생활방언 ‘절 쎄어서라’",
    meaningNote: "사전 절(5429)은 결/사이로, 2025 파도 뜻과 다른 동형이의어다.",
    extraSearchTerms: ["파도", "물결"],
    dictionaryHomographNote:
      "사전 절(seq 5429, 때·기후)은 ‘결(節理)/결(사이)’이고, 2025 기본어휘 절은 파도다. 표준어 절(사찰·절하다)과도 동형이다.",
    decisionNote:
      "앱에 파도 표제어는 없고 생활방언에서 파도 뜻으로 확인된다. 다만 1글자 동형이의어라 실제 반영 전에 표기·동형 처리를 정해야 한다.",
  },
  정주석: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["정주석"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["정주석", "정낭"],
    decisionNote: "정낭을 거는 돌기둥 문화어로 검토한다.",
  },
  족은눈: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["족은눈"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["물안경"],
    alwaysReviewSeqs: ["90346"],
    overrides: {
      90346: {
        result: "DIFFERENT",
        reason: "기존 눈은 해녀 물안경 일반명이고, 족은눈은 두 알 형태라는 하위 유형이다.",
      },
    },
    decisionNote: "두 알 해녀 물안경이라는 문화어로 검토한다. 일반명 눈과 같은 슬롯은 아니다.",
  },
  ᄎᆞᆯ레: {
    ...culture("JEJU_DIALECT_FORM"),
    meaningTerms: ["ᄎᆞᆯ레"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["ᄎᆞᆯ레"],
    decisionNote: "밥과 곁들이는 장·젓 반찬을 가리키는 방언 형태로 검토한다.",
  },
  큰눈: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["큰눈"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["물안경"],
    alwaysReviewSeqs: ["90346"],
    overrides: {
      90346: {
        result: "DIFFERENT",
        reason: "기존 눈은 해녀 물안경 일반명이고, 큰눈은 한 알 형태라는 하위 유형이다.",
      },
    },
    decisionNote: "한 알 해녀 물안경이라는 문화어로 검토한다. 일반명 눈과 같은 슬롯은 아니다.",
  },
  테왁: {
    ...culture("JEJU_CULTURAL_TERM"),
    meaningTerms: ["테왁"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["테왁"],
    decisionNote: "해녀 작업용 부력 기구 문화어로 검토한다.",
  },
  설남은: {
    ...drop(),
    meaningTerms: ["서른 남짓", "서른이 넘는"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["서른"],
    decisionNote: "서른을 조금 넘는 수를 가리키는 좁은 수사 슬롯이다.",
  },
  시꾸다: {
    ...hold(),
    meaningTerms: ["꿈에 보이다", "시꾸다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["꿈"],
    alwaysReviewSeqs: ["2819"],
    overrides: {
      2819: { result: "DIFFERENT", reason: "기존 꿈은 표준어 침(唾)이고, 시꾸다는 꿈에 나타나 보이다는 뜻이다." },
    },
    decisionNote: "현대 사용 근거가 약하고, 기존 꿈(침)과 표기가 겹쳐 보이므로 반영 전 보류한다.",
  },
  와리다: {
    ...hold({ everydayUtility: "MEDIUM" }),
    meaningTerms: ["서두르다", "조바심하다", "조급하다"],
    meaningSource: "2025 definition + AI Hub 조바심하다 mapping",
    extraSearchTerms: ["서두르다", "조바심하다"],
    decisionNote: "조급히 서두르다는 생활 동사 후보이지만, 초급 핵심 슬롯인지는 추가 검토가 필요하다.",
  },
  ᄌᆞ냥ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["비축하다", "아끼다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["비축하다", "아끼다"],
    decisionNote: "공식 수록은 확인했으나 현대 사용 근거가 약해 보류한다.",
  },
  ᄌᆞ들다: {
    ...hold(),
    meaningTerms: ["근심하다", "걱정하다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["근심하다", "걱정하다"],
    decisionNote: "공식 수록은 확인했으나 현대 사용 근거가 약해 보류한다.",
  },
  ᄌᆞ물다: {
    ...hold({ everydayUtility: "MEDIUM" }),
    meaningTerms: ["물질하다", "잠수하다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["물질"],
    alwaysReviewSeqs: ["5009"],
    overrides: {
      5009: {
        result: "DIFFERENT",
        reason: "기존 물질은 명사이고, ᄌᆞ물다는 해산물 채취 동사다. 관련 개념이나 같은 표제어 슬롯은 아니다.",
      },
    },
    decisionNote: "해녀 작업 동사로 관련 명사 물질이 이미 있다. 동사 슬롯 추가 여부는 커리큘럼에서 따로 정한다.",
  },
  튼나다: {
    ...hold(),
    meaningTerms: ["생각나다", "기억나다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["생각나다", "기억나다"],
    decisionNote: "공식 수록은 확인했으나 현대 사용 근거가 약해 보류한다.",
  },
  튼내다: {
    ...hold(),
    meaningTerms: ["생각해내다", "상기시키다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["생각해내다", "상기시키다"],
    decisionNote: "공식 수록은 확인했으나 현대 사용 근거가 약해 보류한다.",
  },
  듬삭ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["푸짐하다", "기름지다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["푸짐하다"],
    alwaysReviewSeqs: ["7327"],
    overrides: {
      7327: { result: "DIFFERENT", reason: "푸지다는 푸짐하다 일반이고, 듬삭하다는 기름진 국물의 입안 감각이라는 더 좁은 뜻이다." },
    },
    decisionNote: "감각 형용사로 고유성은 있으나 현대 사용 근거가 약해 보류한다.",
  },
  베롱ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["희미하다", "약간 밝다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["희미하다"],
    decisionNote: "감각 형용사로 고유성은 있으나 현대 사용 근거가 약해 보류한다.",
  },
  베지근ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["구수하다", "깊은 맛이 있다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["구수하다"],
    decisionNote: "맛 형용사로 고유성은 있으나 현대 사용 근거가 약해 보류한다.",
  },
  복삭ᄒᆞ다1: {
    ...hold(),
    meaningTerms: ["노곤하다"],
    meaningSource: "2025 definition (동형 번호 1)",
    extraSearchTerms: ["노곤하다"],
    decisionNote: "감각 형용사로 고유성은 있으나 현대 사용 근거가 약해 보류한다.",
  },
  뽕끄랑ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["불룩하다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["불룩하다"],
    decisionNote: "상태 형용사로 고유성은 있으나 현대 사용 근거가 약해 보류한다.",
  },
  ᄈᆞ짝ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["꽉 끼다", "작아서 끼다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["끼다"],
    alwaysReviewSeqs: ["90200", "90553"],
    overrides: {
      90200: { result: "DIFFERENT", reason: "찌다1은 사이에 넣어 죄는 끼다(타동)이고, ᄈᆞ짝하다는 옷·신발이 작아 몸에 끼는 상태다." },
      90553: { result: "DIFFERENT", reason: "찌다3은 구름·연기가 끼는 뜻이고, ᄈᆞ짝하다는 옷이 작아 끼는 상태다." },
    },
    decisionNote: "상태 형용사로 고유성은 있으나 현대 사용 근거가 약해 보류한다.",
  },
  저를지다: {
    ...hold(),
    meaningTerms: ["바쁘다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["바쁘다"],
    decisionNote: "공식 수록은 확인했으나 현대 사용 근거가 약해 보류한다.",
  },
  제라지다: {
    ...hold(),
    meaningTerms: ["온전하다", "훌륭하다", "대단하다"],
    meaningSource: "2025 definition + AI Hub 잘한다/대단하다류 mapping",
    extraSearchTerms: ["온전하다", "훌륭하다"],
    decisionNote: "평가 형용사 후보이지만 뜻이 넓고 초급 핵심 슬롯인지는 추가 검토가 필요하다.",
  },
  제라ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["고스란하다", "확실하다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["확실하다"],
    decisionNote: "공식 수록은 확인했으나 현대 사용 근거가 약해 보류한다.",
  },
  조고만ᄒᆞ다: {
    ...drop({ redundancy: "HIGH" }),
    meaningTerms: ["작다", "적다", "조그마하다", "조그맣다"],
    meaningSource: "2025 definition ‘조금 작거나 적다’",
    extraSearchTerms: ["작다", "적다", "조금"],
    alwaysReviewSeqs: ["7289", "90258", "90259", "90303"],
    overrides: {
      7289: { result: "POSSIBLE", reason: "족다(작다)와 ‘작음’ 개념이 겹친다. 조고만하다는 ‘조금 작다’로 정도 수식이 더해진다." },
      90258: { result: "POSSIBLE", reason: "족다1(작다)와 크기 평가가 겹친다." },
      90259: { result: "POSSIBLE", reason: "족다2(적다)와 양·정도 평가가 겹친다." },
      90303: { result: "POSSIBLE", reason: "ᄒᆞ꼼(조금)과 정도 부사 개념이 겹쳐, ‘조금 작다’를 기존 조합으로 가르칠 수 있다." },
    },
    decisionNote: "‘조금 작다’ 개념이 기존 족다·ᄒᆞ꼼과 겹칠 가능성이 커 현 핵심 우선순위에서 제외한다.",
  },
  쪼끌락ᄒᆞ다: {
    ...drop({ redundancy: "HIGH" }),
    meaningTerms: ["작다", "적다", "조그마하다", "조그맣다", "조그만"],
    meaningSource: "2025 definition ‘조금 작거나 적다’ + AI Hub 쪼끌락→작은/조그만 mapping",
    extraSearchTerms: ["작다", "적다", "조금"],
    alwaysReviewSeqs: ["7289", "90258", "90259", "90303"],
    overrides: {
      7289: { result: "POSSIBLE", reason: "족다(작다)와 ‘작음’ 개념이 겹친다." },
      90258: { result: "POSSIBLE", reason: "족다1(작다)와 크기 평가가 겹친다." },
      90259: { result: "POSSIBLE", reason: "족다2(적다)와 양·정도 평가가 겹친다." },
      90303: { result: "POSSIBLE", reason: "ᄒᆞ꼼(조금)과 정도 표현이 겹친다." },
    },
    decisionNote: "‘조금 작다’ 개념이 기존 족다·ᄒᆞ꼼과 겹칠 가능성이 커 현 핵심 우선순위에서 제외한다.",
  },
  코시롱ᄒᆞ다: {
    ...hold(),
    meaningTerms: ["고소하다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["고소하다"],
    decisionNote: "맛·냄새 형용사로 고유성은 있으나 현대 사용 근거가 약해 보류한다.",
  },
  나냥으로: {
    ...core(),
    meaningTerms: ["나대로", "내 스스로", "나 스스로", "내 힘으로", "저 스스로"],
    meaningSource: "2025 definition ‘나 자신의 힘으로’ + AI Hub 나대로/스스로/힘으로 mapping",
    extraSearchTerms: ["스스로", "힘으로"],
    decisionNote: "‘자기 힘으로’라는 독자적 생활 표현으로 기본 서술 효용이 높고, 앱에 같은 개념이 없다.",
  },
  비비작작: {
    ...hold(),
    meaningTerms: ["아무렇게", "박박"],
    meaningSource: "2025 definition + AI Hub 박박 mapping",
    extraSearchTerms: ["아무렇게"],
    alwaysReviewSeqs: ["7453"],
    overrides: {
      7453: { result: "DIFFERENT", reason: "아명은 아무렇게 일반 부사이고, 비비작작은 알아볼 수 없게 그리거나 쓰는 모양이다." },
    },
    decisionNote: "모양 부사로 고유성은 있으나 사용 근거가 약해 보류한다.",
  },
  요자기: {
    ...hold({ everydayUtility: "HIGH", redundancy: "HIGH" }),
    meaningTerms: ["요새", "요사이", "요즘"],
    meaningSource: "2025 definition ‘요사이의 어느 때에’ + AI Hub 요새/요사이/요즘 mapping",
    extraSearchTerms: ["요즘", "요새", "요사이"],
    alwaysReviewSeqs: ["90080"],
    overrides: {
      90080: { result: "SAME_CONCEPT", reason: "기존 요지금(요즘)이 가까운 시점을 가리키는 같은 학습 개념을 이미 다룬다." },
    },
    decisionNote: "생활 시간 부사로 효용은 높으나, 현재 앱의 요지금/요즘과 같은 개념이라 추가 전에 표기 정책을 정해야 한다.",
  },
  저자락: {
    ...hold({ everydayUtility: "MEDIUM" }),
    meaningTerms: ["저정도로", "저렇게까지", "저러한 정도로"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["그다지", "이다지"],
    alwaysReviewSeqs: ["90631", "90656"],
    overrides: {
      90631: { result: "DIFFERENT", reason: "그자락은 그러한 정도(그)이고, 저자락은 저러한 정도(저)로 지시 위치가 다르다." },
      90656: { result: "DIFFERENT", reason: "이자락은 이러한 정도(이)이고, 저자락은 저러한 정도(저)로 지시 위치가 다르다." },
    },
    decisionNote: "그자락·이자락 계열의 저- 형태라 중복은 아니지만, 사용 근거가 약해 보류한다.",
  },
  ᄀᆞ만시라: {
    ...hold(),
    meaningTerms: ["가만있어", "잠깐만"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["가만있어"],
    decisionNote: "감탄사 후보이지만 현대 사용 근거가 약해 보류한다.",
  },
  매기독닥: {
    ...drop(),
    meaningTerms: ["아무것도 없다"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["없다"],
    decisionNote: "빈 그릇을 보이며 없음을 알리는 특정 상황 감탄사라 현재 핵심 생활어 슬롯 우선순위가 낮다.",
  },
  메: {
    ...hold({ everydayUtility: "MEDIUM", redundancy: "MEDIUM" }),
    meaningTerms: ["어머나", "아이고", "어머", "기가막혀"],
    meaningSource: "2025 definition ‘기가 막힐 때 내는 소리’ + 사전 메=메께라(느낌씨) + AI Hub 어머나/아이고 mapping",
    meaningNote: "면서/밥/뽑아 mapping은 오염으로 거부한다. 생활방언의 게메는 글쎄로, 이 감탄사와 다른 말이다.",
    rejectTerms: ["면서", "밥", "뽑아"],
    extraSearchTerms: ["아이고", "글쎄요", "어머나"],
    alwaysReviewSeqs: ["90310", "90307"],
    dictionaryHomographNote:
      "사전 메는 세 동형이다: 7556 메께라(느낌씨, 2025 뜻과 일치), 4326 모종, 3589 멥밥.",
    overrides: {
      90310: {
        result: "POSSIBLE",
        reason: "아고(아이고)도 기막히거나 놀랄 때 쓰는 감탄사여서, 메/메께라와 학습 슬롯이 겹칠 수 있다.",
      },
      90307: {
        result: "DIFFERENT",
        reason: "게메마씸은 글쎄요(불확실 응답)이고, 메/메께라는 기가 막힐 때 내는 소리다. 생활방언 게메와도 다른 말이다.",
      },
    },
    decisionNote:
      "책·사전은 감탄사 메께라이고 말뭉치 어머나/아이고 mapping도 있다. 다만 1글자 동형(모종·멥밥)과 기존 아고와의 감탄사 겹침을 반영 전에 더 봐야 한다.",
  },
  봅서: {
    ...hold({ everydayUtility: "MEDIUM", redundancy: "MEDIUM" }),
    meaningTerms: ["여보세요", "이봐요", "여보시오"],
    meaningSource: "2025 definition·POS(감탄사) ‘가까이에 있는 사람이나 듣는 이를 부를 때’ + 사전 날봅서=여보시오",
    meaningNote:
      "AI Hub 보세요/봐요와 생활방언 ‘와서 보십시오/꽃 봅서/먹어 봅서’는 동사 보다의 존대 명령이지, 책의 호격 감탄사가 아니다. 책 뜻 앵커와 뭉뚱그리지 않는다.",
    extraSearchTerms: ["보다", "여보시오"],
    alwaysReviewSeqs: ["90176", "90206"],
    overrides: {
      90176: {
        result: "POSSIBLE",
        reason: "말뭉치·생활방언의 봅서는 보다의 존대 명령(보세요)으로 쓰여, 기존 베리다/보다와 겹칠 수 있다. 책 뜻(호격 감탄사)과는 별개다.",
      },
      90206: { result: "DIFFERENT", reason: "ᄎᆞᆽ아보다는 찾아보다 복합동사이고, 봅서의 호격 감탄사 뜻과 다르다." },
    },
    decisionNote:
      "3C-1.1의 ‘듣는 이를 부르는 실용적 감탄사’는 책 POS/뜻과는 맞지만, 확인된 현대 용례는 대부분 보다 존대 명령이다. 호격 용법의 의미 맞는 말뭉치 mapping은 확인하지 못해 CORE에서 보류한다.",
  },
  옴마가라: {
    ...hold(),
    meaningTerms: ["깜짝이야", "어머나"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["놀라다"],
    alwaysReviewSeqs: ["90310"],
    overrides: {
      90310: {
        result: "DIFFERENT",
        reason: "아고는 아이고 일반 감탄사이고, 옴마가라는 예상 못 한 일에 끔찍함·놀람을 나타내는 별도 감탄사다.",
      },
    },
    decisionNote: "놀람 감탄사 후보이지만 현대 사용 근거가 약해 보류한다.",
  },
  ᄎᆞ마가라: {
    ...hold(),
    meaningTerms: ["못마땅하다", "에이"],
    meaningSource: "2025 definition",
    extraSearchTerms: ["못마땅"],
    decisionNote: "못마땅함 감탄사 후보이지만 현대 사용 근거가 약해 보류한다.",
  },
};

function linePairs(items) {
  const split = (value) => String(value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  const pairs = [];
  for (const item of items) {
    for (const source of [item.contents, item.original]) {
      const jeju = split(source);
      const standard = split(item.solution);
      if (jeju.length === standard.length) {
        jeju.forEach((line, index) => pairs.push({ jeju: line, standard: standard[index] }));
      }
    }
  }
  return pairs;
}

function tokenizeJeju(line) {
  return line
    .split(/\s+/)
    .map((raw) => raw.replace(/^[",.!?…()]+|[",.!?…()]+$/g, ""))
    .filter(Boolean);
}

function isVerbLikePos(pos) {
  return pos === "동사" || pos === "형용사";
}

export function inflectionRoots(forms, pos) {
  const roots = new Set();
  for (const form of forms) {
    const stripped = stripHomograph(form);
    if (!stripped) continue;
    roots.add(stripped);
    if (stripped.endsWith("ᄒᆞ다") && stripped.length > 3) roots.add(stripped.slice(0, -3));
    if (stripped.endsWith("하다") && stripped.length > 2) roots.add(stripped.slice(0, -2));
    if (isVerbLikePos(pos) && stripped.endsWith("다") && stripped.length > 1) {
      roots.add(stripped.slice(0, -1));
    }
  }
  return [...roots];
}

function classifyMapping(mapping, meaningTerms, rejectTerms, verbLike) {
  if (rejectTerms.some((term) => mappingMatches(term, mapping, false) || normalizeTerm(mapping) === normalizeTerm(term))) {
    return "rejected";
  }
  if (meaningTerms.some((term) => mappingMatches(term, mapping, verbLike))) return "matched";
  return "ambiguous";
}

export function classifyAihub({ forms, pos, meaningTerms, rejectTerms = [], tokens, firstCharIndex }) {
  const verbLike = isVerbLikePos(pos);
  const exactKeys = [...new Set(forms.flatMap((form) => [form, stripHomograph(form)].filter(Boolean)))];
  let rawFormHits = 0;
  const matched = new Map();
  let ambiguousHits = 0;
  let rejectedHits = 0;
  const countedTokens = new Set();

  const addForms = (formList, hits) => {
    for (const [standard, count] of formList) {
      const bucket = classifyMapping(standard, meaningTerms, rejectTerms, verbLike);
      if (bucket === "matched") {
        matched.set(standard, (matched.get(standard) ?? 0) + count);
      } else if (bucket === "rejected") rejectedHits += count;
      else ambiguousHits += count;
    }
    return hits;
  };

  for (const key of exactKeys) {
    const entry = tokens[key];
    if (!entry) continue;
    countedTokens.add(key);
    rawFormHits += entry.reduce((sum, [, count]) => sum + count, 0);
    addForms(entry);
  }

  const maxSuffix = isVerbLikePos(pos) ? MAX_VERB_SUFFIX_LEN : MAX_NOUN_SUFFIX_LEN;
  let rawInflectedHits = 0;
  for (const root of inflectionRoots(forms, pos)) {
    if (root.length < 2) continue;
    const candidates = firstCharIndex.get(root[0]) ?? [];
    for (const [token, formList] of candidates) {
      if (countedTokens.has(token)) continue;
      if (!token.startsWith(root)) continue;
      if (token.length > root.length + maxSuffix) continue;
      countedTokens.add(token);
      const tokenHits = formList.reduce((sum, [, count]) => sum + count, 0);
      rawInflectedHits += tokenHits;
      addForms(formList);
    }
  }

  const matchedStandardTerms = [...matched.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([term, hits]) => ({ term, hits }));
  const meaningMatchedMappingHits = matchedStandardTerms.reduce((sum, row) => sum + row.hits, 0);

  return {
    rawFormHits,
    rawInflectedHits,
    meaningMatchedMappingHits,
    ambiguousMappingHits: ambiguousHits,
    rejectedMappingHits: rejectedHits,
    matchedStandardTerms,
    contextAvailable: false,
  };
}

export function classifyLifeDialect({ forms, pos, meaningTerms, pairs }) {
  const verbLike = isVerbLikePos(pos);
  const exact = new Set(forms.map(stripHomograph));
  const roots = inflectionRoots(forms, pos);
  const examples = [];
  let rawHits = 0;
  let contextVerifiedHits = 0;
  const seenRaw = new Set();
  const seenVerified = new Set();

  for (const pair of pairs) {
    const tokens = tokenizeJeju(pair.jeju);
    const hit = tokens.some((token) => {
      const stripped = stripHomograph(token);
      if (exact.has(stripped)) return true;
      if (stripped.length <= 1) return false;
      return roots.some((root) => root.length >= 2 && stripped.startsWith(root));
    });
    if (!hit) continue;
    const standardKey = normalizeTerm(pair.standard);
    if (!seenRaw.has(standardKey)) {
      seenRaw.add(standardKey);
      rawHits += 1;
    }
    const verified = meaningTerms.some((term) => mappingMatches(term, pair.standard, verbLike));
    if (verified && !seenVerified.has(standardKey)) {
      seenVerified.add(standardKey);
      contextVerifiedHits += 1;
      if (examples.length < 3) examples.push({ jeju: pair.jeju, standard: pair.standard, verified: true });
    }
  }

  return {
    rawHits,
    contextVerifiedHits,
    examples,
    note: "제주어 줄과 표준어 풀이 줄 수가 같은 자료만 뜻 대조에 썼다. contextVerifiedHits는 그 줄의 표준어 풀이가 의미 앵커와 맞을 때만 센다.",
  };
}

function findDuplicateCandidates({ forms, meaningTerms, extraSearchTerms = [], alwaysReviewSeqs = [], lexemes }) {
  const formSet = new Set(forms.map(stripHomograph));
  const meaningSet = new Set(meaningTerms.map(normalizeTerm).filter(Boolean));
  const searchSet = new Set(
    [...meaningTerms, ...extraSearchTerms].map(normalizeTerm).filter((term) => term.length >= 2),
  );
  const found = new Map();

  const consider = (lex, via) => {
    const current = found.get(lex.seq);
    if (!current) found.set(lex.seq, { lex, via: new Set([via]) });
    else current.via.add(via);
  };

  for (const lex of lexemes) {
    const jejuForms = [lex.jeju, ...(lex.bookMeta?.otherJejuForms ?? [])].map(stripHomograph);
    if (jejuForms.some((value) => formSet.has(value))) consider(lex, "form");
    const std = normalizeTerm(lex.standard);
    if (std && meaningSet.has(std)) consider(lex, "standard");
    else if (std && searchSet.has(std)) consider(lex, "search-standard");
    const def = normalizeTerm(lex.bookMeta?.definition ?? "");
    for (const term of searchSet) {
      if (term.length >= 5 && def && def.includes(term) && std !== term) consider(lex, "search-concept");
    }
  }

  for (const seq of alwaysReviewSeqs) {
    const lex = lexemes.find((row) => row.seq === seq);
    if (lex) consider(lex, "manual");
  }

  return [...found.values()];
}

function autoDuplicateResult(lex, via) {
  if (via.has("form")) return "VARIANT";
  if (via.has("standard")) return "SAME_CONCEPT";
  return "DIFFERENT";
}

const STATUS_RANK = {
  VARIANT_ALREADY_PRESENT: 3,
  SAME_CONCEPT_ALREADY_PRESENT: 2,
  POSSIBLE_DUPLICATE: 1,
  NO_DUPLICATE: 0,
};

const RESULT_TO_STATUS = {
  VARIANT: "VARIANT_ALREADY_PRESENT",
  SAME_CONCEPT: "SAME_CONCEPT_ALREADY_PRESENT",
  POSSIBLE: "POSSIBLE_DUPLICATE",
  DIFFERENT: "NO_DUPLICATE",
};

export function reviewDuplicates({ forms, meaningTerms, extraSearchTerms, alwaysReviewSeqs, overrides = {}, lexemes }) {
  const found = findDuplicateCandidates({ forms, meaningTerms, extraSearchTerms, alwaysReviewSeqs, lexemes });
  const candidateConceptsReviewed = found.map(({ lex, via }) => {
    const override = overrides[lex.seq];
    const result = override?.result ?? autoDuplicateResult(lex, via);
    const reason =
      override?.reason ??
      (result === "VARIANT"
        ? "동일 제주어 표기가 현재 content의 주표제어 또는 변이형에 있다."
        : result === "SAME_CONCEPT"
          ? `기존 표준어 “${lex.standard}”가 의미 앵커와 같다.`
          : `탐색어는 겹치나 기존 ${lex.jeju}/${lex.standard}의 학습 개념은 이 후보와 다르다.`);
    return {
      seq: lex.seq,
      jeju: lex.jeju,
      standard: lex.standard,
      result,
      reason,
    };
  });

  let status = "NO_DUPLICATE";
  for (const row of candidateConceptsReviewed) {
    const mapped = RESULT_TO_STATUS[row.result] ?? "NO_DUPLICATE";
    if (STATUS_RANK[mapped] > STATUS_RANK[status]) status = mapped;
  }

  const reason =
    candidateConceptsReviewed.length === 0
      ? `의미 앵커(${meaningTerms.join(", ")})와 추가 탐색어로 현재 lexemes의 제주어·변이형·표준어·책 뜻풀이를 검색했으나 대조 후보가 없었다.`
      : status === "NO_DUPLICATE"
        ? "검색된 후보는 있으나 뜻을 대조한 결과 같은 학습 개념이 아니었다."
        : candidateConceptsReviewed
            .filter((row) => RESULT_TO_STATUS[row.result] === status)
            .map((row) => row.reason)
            .join(" ");

  return {
    status,
    anchorsUsed: meaningTerms,
    candidateSeqsReviewed: candidateConceptsReviewed.map((row) => row.seq),
    candidateConceptsReviewed,
    reason,
  };
}

function scoreOf({ usageEvidence, everydayUtility, jejuDistinctiveness, culturalImportance, redundancy, level }) {
  return Math.max(
    0,
    Math.min(
      100,
      EVIDENCE[usageEvidence] +
        AXIS[everydayUtility] +
        AXIS[jejuDistinctiveness] * 0.6 +
        AXIS[culturalImportance] * 0.6 -
        AXIS[redundancy] * 0.5 +
        (level === "초급" ? 10 : 5),
    ),
  );
}

function dictionaryHits(forms, dictionary) {
  const want = new Set(forms.map(stripHomograph));
  return dictionary.filter((entry) => {
    const names = [entry.name, entry.siteName, String(entry.name ?? "").replace(/-/g, ""), String(entry.siteName ?? "").replace(/-/g, "")].map(
      stripHomograph,
    );
    return names.some((name) => want.has(name));
  });
}

function buildFirstCharIndex(tokens) {
  const index = new Map();
  for (const [token, forms] of Object.entries(tokens)) {
    if (!token) continue;
    const key = token[0];
    if (!index.has(key)) index.set(key, []);
    index.get(key).push([token, forms]);
  }
  return index;
}

export function buildAudit({ candidates, vocab, lexemes, tokens, dictionary, lifeItems }) {
  if (candidates.length !== 71 || new Set(candidates.map((row) => row.stable_id)).size !== 71) {
    throw new Error("Expected 71 unique candidates");
  }
  const sourceById = new Map(vocab.map((row) => [row.stableId, row]));
  const pairs = linePairs(lifeItems);
  const firstCharIndex = buildFirstCharIndex(tokens);
  const missingCatalog = candidates.filter((row) => !CATALOG[row.jeju_forms[0]]);
  if (missingCatalog.length) {
    throw new Error(`Catalog missing: ${missingCatalog.map((row) => row.jeju_forms[0]).join(", ")}`);
  }

  const rows = candidates.map((candidate) => {
    const source = sourceById.get(candidate.stable_id);
    if (!source) throw new Error(`Missing vocab source ${candidate.stable_id}`);
    const form = candidate.jeju_forms[0];
    const spec = CATALOG[form];
    const meaningTerms = spec.meaningTerms;
    const rejectTerms = spec.rejectTerms ?? [];
    const aihub = classifyAihub({
      forms: candidate.jeju_forms,
      pos: candidate.pos,
      meaningTerms,
      rejectTerms,
      tokens,
      firstCharIndex,
    });
    const lifeDialect = classifyLifeDialect({
      forms: candidate.jeju_forms,
      pos: candidate.pos,
      meaningTerms,
      pairs,
    });
    const usageEvidence = usageTier({
      meaningMatched: aihub.meaningMatchedMappingHits,
      lifeVerified: lifeDialect.contextVerifiedHits,
    });
    const duplicate = reviewDuplicates({
      forms: candidate.jeju_forms,
      meaningTerms,
      extraSearchTerms: spec.extraSearchTerms ?? [],
      alwaysReviewSeqs: spec.alwaysReviewSeqs ?? [],
      overrides: spec.overrides ?? {},
      lexemes,
    });
    const dictEntries = dictionaryHits(candidate.jeju_forms, dictionary);
    const jejuDistinctiveness = candidate.has_standard_equivalent ? "MEDIUM" : "HIGH";
    const assessment = {
      everydayUtility: spec.everydayUtility,
      jejuDistinctiveness,
      culturalImportance: spec.culturalImportance,
      redundancy: spec.redundancy,
      officialLevel: candidate.level,
    };
    if (spec.linguisticType) assessment.linguisticType = spec.linguisticType;
    const score = scoreOf({ ...assessment, usageEvidence, level: candidate.level });
    const prev3c1 = previousDecision(form, PREV_3C1);
    const prev3c11 = PREV_3C11_CORE.includes(form) ? "CORE_ADD" : prev3c1 === "CORE_ADD" ? "HOLD" : prev3c1;

    return {
      stableId: candidate.stable_id,
      numericId: candidate.numeric_id,
      jejuForms: candidate.jeju_forms,
      level: candidate.level,
      sourcePos: candidate.pos,
      definition: source.definition,
      hasStandardEquivalent: candidate.has_standard_equivalent,
      meaningAnchors: {
        standardTerms: meaningTerms,
        source: spec.meaningSource,
        note: spec.meaningNote ?? null,
        rejectTerms,
      },
      evidence: {
        aihub: {
          ...aihub,
          note: "tokens.json은 표준어 mapping과 빈도만 제공하며 발화 ID·원문이 없다. meaning-matched mapping이지 발화 문맥 확인이 아니다.",
        },
        lifeDialect,
        dictionaryHit: dictEntries.length > 0,
        dictionaryEntrySeqs: dictEntries.map((entry) => entry.seq),
        dictionaryHomographNote: spec.dictionaryHomographNote ?? null,
        officialBasicVocab2025: true,
        externalEvidence: EXTERNAL[form] ?? [],
      },
      usageEvidence,
      semanticDuplicateReview: duplicate,
      assessment,
      score,
      decision: spec.decision,
      decisionBasis: [
        spec.decisionNote,
        "2025 기본어휘의 표제어·등급·뜻풀이를 원장과 대조했다.",
        `현대 사용 근거 등급은 decision과 독립적으로 ${usageEvidence}로 계산했다.`,
        `의미 중복 상태는 ${duplicate.status}이다.`,
      ],
      manualReviewNote: "최종 decision은 자동 score의 임계값이 아니라 이 행의 개별 평가축과 근거를 검토한 수동 판정이다.",
      previousDecision: prev3c11,
      previousDecision3c1: prev3c1,
      previousDecision3c11: prev3c11,
    };
  });

  const decisions = ["CORE_ADD", "CULTURE_ADD", "HOLD", "DO_NOT_ADD"];
  const duplicates = ["NO_DUPLICATE", "VARIANT_ALREADY_PRESENT", "SAME_CONCEPT_ALREADY_PRESENT", "POSSIBLE_DUPLICATE"];
  const usages = ["STRONG", "MEDIUM", "WEAK", "NONE"];
  const count = (key, values) =>
    Object.fromEntries(
      values.map((entry) => [
        entry,
        rows.filter((row) => (key === "semanticDuplicateReview" ? row[key].status === entry : row[key] === entry)).length,
      ]),
    );

  for (const row of rows) {
    if (!row.meaningAnchors?.standardTerms?.length) throw new Error(`missing meaningAnchors: ${row.jejuForms[0]}`);
    if (!row.semanticDuplicateReview?.candidateConceptsReviewed) throw new Error(`missing duplicate trail: ${row.jejuForms[0]}`);
    if (!row.decisionBasis?.length) throw new Error(`missing decisionBasis: ${row.jejuForms[0]}`);
    if (row.evidence.aihub.verifiedContextHits != null) throw new Error("aihub must not use verifiedContextHits");
    if (!decisions.includes(row.decision)) throw new Error(`bad decision: ${row.decision}`);
  }
  if (rows.length !== 71) throw new Error("3C-1.2 audit invariants failed");

  const delta = rows
    .filter((row) => row.previousDecision3c11 !== row.decision)
    .map((row) => ({
      candidate: row.jejuForms[0],
      decision3c1: row.previousDecision3c1,
      decision3c11: row.previousDecision3c11,
      decision3c12: row.decision,
      reason: row.decisionBasis[0],
    }));

  return {
    schemaVersion: 3,
    generatedFrom: "repository inputs; deterministic output from scripts/audit_new_basic_vocab_candidates.mjs CATALOG",
    scope: "3C-1.2 methodology correction only; production content unchanged",
    method: [
      "각 후보에 concise meaningAnchors.standardTerms를 두고, source.definition 긴 문장을 usage matcher의 standard로 넣지 않는다.",
      "AI Hub는 raw form hits와 meaning-matched mapping hits를 분리한다. tokens.json에 원문이 없어 verifiedContextHits라는 필드를 쓰지 않는다.",
      "생활방언은 줄 정렬이 맞는 쌍만 쓰고, 표준어 풀이가 의미 앵커와 맞을 때만 contextVerifiedHits로 센다.",
      "usageEvidence와 score는 decision을 참조하지 않는다.",
      "의미 중복은 제주어 형태·표준어 앵커·개념 탐색어로 후보를 만든 뒤, 각 후보의 뜻을 대조한 candidateConceptsReviewed trail을 남긴다. 기본값 NO_DUPLICATE만 찍지 않는다.",
      "CORE_ADD=생활 핵심 반영 우선 후보, CULTURE_ADD=문화 트랙 반영 우선 후보, HOLD=추가 검증 전 보류, DO_NOT_ADD=현재 핵심 앱 우선순위에서 제외. ADD가 있어도 자동 production 반영이 아니다.",
    ],
    limitations: [
      "AI Hub tokens.json에 발화 ID/원문이 없어 meaning-matched mapping을 발화 문맥 확인으로 주장하지 않는다.",
      "NONE은 사어 판정이 아니며 DO_NOT_ADD는 현 핵심 앱의 우선순위 판단이다.",
      "말뭉치 화자/주제 편향이 있어 고빈도 mapping이 곧 전 세대 생활어를 뜻하지 않는다.",
    ],
    summary: {
      rows: rows.length,
      uniqueStableIds: new Set(rows.map((row) => row.stableId)).size,
      decisions: count("decision", decisions),
      usageEvidence: count("usageEvidence", usages),
      semanticDuplicateReview: count("semanticDuplicateReview", duplicates),
      linguisticType: {
        JEJU_DIALECT_FORM: rows.filter((row) => row.assessment.linguisticType === "JEJU_DIALECT_FORM").length,
        JEJU_CULTURAL_TERM: rows.filter((row) => row.assessment.linguisticType === "JEJU_CULTURAL_TERM").length,
        BOTH: rows.filter((row) => row.assessment.linguisticType === "BOTH").length,
      },
      deltaFrom3c11: { unchanged: rows.length - delta.length, changed: delta.length },
    },
    delta,
    rows,
  };
}

const readJson = (relative) => JSON.parse(readFileSync(path.join(ROOT, relative), "utf8"));

export function loadAuditInputs() {
  return {
    candidates: readJson("data/jeju-basic-vocab-2025/content-new-candidates-3a.json"),
    vocab: readJson("data/jeju-basic-vocab-2025/vocab.json").entries,
    lexemes: readJson("content/lexemes.json"),
    tokens: readJson("data/aihub/tokens.json"),
    dictionary: readJson("data/dictionary/jeju_dialect_full.json"),
    lifeItems: readJson("data/life-dialect/items.json"),
  };
}

function main() {
  const audit = buildAudit(loadAuditInputs());
  writeFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/new-candidates-living-audit-3c1.json"), `${JSON.stringify(audit, null, 2)}\n`);
  console.log(JSON.stringify(audit.summary, null, 2));
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();
