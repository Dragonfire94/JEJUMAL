#!/usr/bin/env node
/**
 * 2025 기본어휘 1,501개에 상황 테마를 부여한다. (v2: 구(phrase) 기반 정밀 규칙)
 * - 입력: data/jeju-basic-vocab-2025/vocab.json (+ data/theme-overrides.json 수동 지정)
 * - 출력: data/theme-assignments.json
 *
 * 규칙: 정의문 위주로 2자 이상 구를 매칭. 한 글자 키워드 금지.
 * 앞에 나올수록 우선순위가 높다.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const VOCAB = JSON.parse(readFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/vocab.json"), "utf8"));
const entries = VOCAB.entries;

export const THEMES = [
  { id: "greeting", title: "기초/인사" },
  { id: "family", title: "가족/사람" },
  { id: "body", title: "몸/건강" },
  { id: "food", title: "음식" },
  { id: "market", title: "시장에서" },
  { id: "home", title: "집안일" },
  { id: "sea", title: "바다/물질" },
  { id: "farm", title: "농사" },
  { id: "nature", title: "자연/날씨" },
  { id: "animals", title: "동식물" },
  { id: "move", title: "이동" },
  { id: "work", title: "일/노동" },
  { id: "emotion", title: "감정/성격" },
  { id: "time", title: "시간/방향/수량" },
  { id: "etc", title: "기타" },
];

/** 품사 기반: 문법어(대명사·수사·의존명사·감탄사·관형사)는 기초 테마로 */
const POS_THEME = {
  "대명사": "greeting",
  "수사": "greeting",
  "의존명사": "greeting",
  "감탄사": "greeting",
  "관형사": "greeting",
};

const RULES = [
  ["greeting", [
    "인사를", "인사말", "안부를", "소개", "처음 만났을 때", "헤어질 때", "맞아들이",
    "환영", "어서 오", "잘 가", "반갑게", "대답할 때", "부름에",
    "같다", "같지", "존재하지", "말로 표현", "말로 나타내", "지식", "하게 하다",
    "양보", "그대로", "한계를", "반복", "한꺼번에", "여럿 가운데 가장",
    "움직이지 않", "아무 말 없이", "그와 같이", "이와 같이", "저와 같이",
    "그렇다 치고", "미치지", "바꾸", "대체되", "온전", "반듯", "이상스럽",
    "쓸모", "알게 되",
  ]],
  ["body", [
    "몸통", "신체", "얼굴", "눈의", "눈에", "눈을", "눈꺼풀", "눈썹", "생김새",
    "코에", "코를", "코의", "콧", "입에", "입을", "입의", "입술", "이빨", "치아", "혀를",
    "귀에", "귀를", "머리를", "머리에", "머리카락",
    "손을", "손에", "손으로", "손가락", "있는 손", "손이",
    "발을", "발에", "발로", "발가락", "팔을", "다리를",
    "어깨", "가슴", "허리", "무릎", "피부에", "피부가", "살갗", "뼈", "심장",
    "배가 고프", "배가 부르", "배앓이", "뱃속",
    "병에 걸", "병을", "아프", "건강", "치료", "약을", "기침", "상처", "땀이", "땀을",
    "눈물을", "숨을", "숨이", "열이 나", "감기", "두통", "복통", "의사", "병원",
    "분비", "침샘", "코로", "눈알", "입 속", "촉감", "부드럽", "서늘", "찬 느낌",
    "누고 싶", "감추",
  ]],
  ["sea", [
    "바다", "바닷", "해녀", "물질", "잠수", "고기잡이", "어부", "파도", "썰물", "밀물",
    "조개", "전복", "소라", "해삼", "성게", "해초", "미역", "다시마", "톳", "물고기",
    "고등어", "갈치", "옥돔", "자리돔", "문어", "오징어", "낙지", "주꾸미", "새우",
    "그물을", "그물에", "낚시", "어장", "포구", "항구", "배를 타", "배에 오르",
    "연체동물", "갑각류", "해산물", "수산물", "조업",
  ]],
  ["farm", [
    "밭", "농사", "벼", "보리", "조를", "기장", "감자", "고구마", "무를", "배추",
    "마늘", "양파", "수확", "파종", "모내기", "김매기", "거름", "쟁기", "낫", "호미",
    "곡식", "농부", "밭일", "이삭", "짚", "겨", "맷돌", "절구", "도리깨", "키질",
    "씨앗", "모종", "가을걷이", "잡아떼",
  ]],
  ["food", [
    "음식", "밥", "쌀", "국을", "반찬", "김치", "된장", "간장", "고추장",
    "고기를", "생선을", "회를", "구이", "찜", "튀김", "볶음", "죽을", "떡", "과자",
    "빵", "술을", "차를", "물을 마시", "먹는", "먹다", "먹게", "마시", "씹", "삼키",
    "요리", "끓이", "볶", "굽", "찌", "맛이", "맛을", "달콤", "짜", "매운맛", "신맛", "쓴맛",
    "젓갈", "식사", "식탁", "수저", "젓가락", "그릇", "냄비", "솥", "식초", "설탕", "소금",
    "참기름", "들기름", "양념", "나물", "제사음식", "눌어붙", "상한 음식", "덜 차다", "오이", "쏟아", "차가운 물",
  ]],
  ["family", [
    "아버지", "어머니", "부모", "형제", "자매", "할아버지", "할머니", "아들", "딸",
    "조카", "며느리", "사위", "친척", "외가", "친가", "호칭", "부르는 말", "이르거나 부르는",
    "남편", "아내", "부부", "신랑", "신부", "결혼", "이웃", "친구", "동무",
    "남자", "여자", "어른", "아이", "아기", "노인", "젊은이", "손님", "주인",
    "외할머니", "외할아버지", "친할머니", "삼촌", "고모", "이모", "외삼촌",
    "마을", "동네", "잔치", "제사", "굿", "심방", "다른 사람", "넋", "사회", "놀이", "더불어",
  ]],
  ["market", [
    "시장", "가게", "장사", "값을", "가격", "값이 싸", "값이 싼", "비싸", "깎", "흥정",
    "거스름돈", "지갑", "물건", "상품", "장바구니", "계산", "가려내",
  ]],
  ["home", [
    "방", "부엌", "마당", "대문", "창문", "지붕", "벽", "바닥",
    "청소", "빨래", "설거지", "이불", "베개", "옷", "바지", "치마", "신발", "모자",
    "살림", "가구", "의자", "책상", "전기", "잠을 자", "잠자", "일어나", "자고 싶",
    "집에", "집의", "집을", "집안", "안방", "사랑방", "부엌일", "장독", "풀칠", "머물", "끼우",
    "닫히", "자국", "티끌", "집채", "쓸어", "빠는", "천의 조각", "불에", "불을 지펴",
    "뚫어지", "빈둥",
  ]],
  ["nature", [
    "하늘", "구름", "비가", "비를", "눈이", "눈을", "바람이", "바람을", "태풍", "장마",
    "햇빛", "달이", "달을", "별이", "별을", "해가", "해를", "산을", "산에", "들을",
    "강이", "강을", "강가", "계곡", "땅", "흙", "돌이", "돌을", "돌로", "모래", "숲", "나무", "꽃", "풀",
    "날씨", "계절", "봄", "여름", "가을", "겨울", "춥", "덥", "서리", "이슬",
    "무지개", "번개", "천둥", "안개", "그늘", "햇볕",
    "천체", "비추", "화산", "오름", "빛깔", "잔디", "퍼지", "빛이",
    "검다", "희다", "붉다", "푸르다", "노랗다", "둥글",
  ]],
  ["animals", [
    "동물", "짐승", "포유류", "조류", "파충류", "양서류", "곤충",
    "소를", "말을", "돼지", "닭", "개를", "고양이", "새를", "까마귀", "독수리",
    "뱀", "개구리", "나비", "벌", "파리", "모기", "거미", "지렁이", "달팽이",
    "쥐", "토끼", "사슴", "꿩", "까치", "제비", "여우", "늑대", "호랑이",
    "소나무", "대나무", "버섯", "새끼", "어린 소", "어린 말", "어린 개", "갓 태어나", "털", "깃털",
    "과의 새",
  ]],
  ["move", [
    "걷", "뛰", "달리", "기어", "날", "헤엄", "타고", "내리", "오르", "내려",
    "건너", "돌아", "길을", "도로", "다리를 건너", "자동차", "버스", "기차", "비행기",
    "동쪽", "서쪽", "남쪽", "북쪽", "앞으로", "뒤로", "옆으로", "위로", "아래로",
    "여행", "이사", "출발", "도착", "방향", "가다", "오다", "가로막",
  ]],
  ["work", [
    "일하", "노동", "직업", "회사", "공장", "만들", "고치", "짓", "도구",
    "망치", "톱", "삽", "괭이", "바느질", "꿰매", "짜", "엮", "운전", "돈벌이",
    "품삯", "일꾼", "날을 갈", "애를 쓰", "바쁘",
  ]],
  ["emotion", [
    "마음", "기분", "슬프", "기쁘", "즐겁", "즐거", "화나", "무섭", "외롭", "그리",
    "사랑", "미움", "부끄럽", "걱정", "놀라", "웃", "울", "성격", "착하", "얌전",
    "용감", "겁쟁이", "성미", "고집", "욕심", "질투", "미련", "후회", "반갑",
    "다정", "친근", "밉", "얄밉", "심술", "토라지", "삐지",
    "마음을 쓰는", "분한 마음", "마음이 간절", "어리석", "야무지", "조심스럽", "믿음",
    "버티", "꿈",
  ]],
  ["time", [
    "시간", "오늘", "내일", "어제", "아침", "낮", "밤에", "밤이", "한 밤", "밤중", "밤새", "새벽", "저녁",
    "지금", "나중", "먼저", "이따", "빨리", "천천히", "자주", "가끔", "항상",
    "숫자", "하나", "둘", "셋", "넷", "다섯", "많", "적다", "적은", "크다", "큰", "작다", "작은",
    "길다", "긴", "길이", "짧", "높", "넓", "좁", "무겁", "가볍", "빠르", "느리",
    "전부", "모두", "전혀", "아주", "매우", "조금", "이리", "저리", "그리",
    "여기", "저기", "거기", "이쪽", "저쪽", "왼쪽", "오른쪽", "십이지",
    "양쪽의 사이", "끝이 없", "멀다", "입춘",
  ]],
];

/** 표준어 표제어 전체 일치로 테마를 확정하는 표 (정의문 신호가 약한 단어용) */
const HEADWORD_THEMES = {
  greeting: ["어서", "아이고"],
};

function textOf(entry) {
  return `${entry.standard_raw ?? ""} ${(entry.jeju_forms ?? []).join(" ")} ${entry.definition ?? ""}`;
}

const assigned = {};
const hitKw = {};
for (const entry of entries) {
  // 1) 품사 기반 (문법어는 기초 테마)
  if (POS_THEME[entry.pos]) {
    assigned[entry.id] = POS_THEME[entry.pos];
    hitKw[entry.id] = `품사:${entry.pos}`;
    continue;
  }
  // 2) 키워드 규칙
  const text = textOf(entry);
  let found = null;
  for (const [themeId, keywords] of RULES) {
    const kw = keywords.find((k) => text.includes(k));
    if (kw) { found = { themeId, kw }; break; }
  }
  if (!found) {
    const std = (entry.standard_raw ?? "").replace(/[0-9]+$/, "");
    for (const [themeId, words] of Object.entries(HEADWORD_THEMES)) {
      if (words.includes(std)) { found = { themeId, kw: `표제어:${std}` }; break; }
    }
  }
  if (found) {
    assigned[entry.id] = found.themeId;
    hitKw[entry.id] = found.kw;
  }
}

// 3) 수동 override를 먼저 적용
const overridePath = path.join(ROOT, "data/theme-overrides.json");
if (existsSync(overridePath)) {
  const overrides = JSON.parse(readFileSync(overridePath, "utf8"));
  for (const [id, themeId] of Object.entries(overrides)) {
    if (THEMES.some((t) => t.id === themeId)) {
      assigned[id] = themeId;
      hitKw[id] = "수동지정";
    }
  }
}

// 4) 같은 표준어 표제어(번호 제거)는 같은 테마로 강제 — 동형이의어 쌍이 흩어지지 않게.
//    책 순서상 먼저 나온 entry의 테마를 따른다.
const headwordGroup = new Map();
for (const entry of entries) {
  const hw = (entry.standard_raw ?? "").replace(/[0-9①-⑳¹²³⁴⁵⁶⁷⁸⁹⁰]+$/u, "").trim() || `(고유어:${entry.id})`;
  if (!headwordGroup.has(hw)) headwordGroup.set(hw, []);
  headwordGroup.get(hw).push(entry);
}
let forced = 0;
for (const group of headwordGroup.values()) {
  if (group.length < 2) continue;
  const firstTheme = assigned[group[0].id];
  if (!firstTheme) continue;
  for (const e of group.slice(1)) {
    if (assigned[e.id] !== firstTheme) {
      assigned[e.id] = firstTheme;
      hitKw[e.id] = `표제어그룹:${group[0].id}`;
      forced++;
    }
  }
}
console.log(`표제어 그룹 강제 적용: ${forced}개`);

const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
const unassigned = entries.filter((e) => !assigned[e.id]);

const dist = {};
for (const id of Object.values(assigned)) dist[id] = (dist[id] ?? 0) + 1;
console.log("=== 테마 분포 ===");
for (const t of THEMES) console.log(`  ${t.id} (${t.title}): ${dist[t.id] ?? 0}`);
console.log(`\n미분류: ${unassigned.length}개`);
console.log("=== 미분류 전체 ===");
for (const e of unassigned) {
  const jf = (e.jeju_forms ?? [])[0] ?? "-";
  console.log(`  ${e.id} [${e.pos}/${e.level}] ${e.standard_raw ?? "(고유어)"}(${jf}): ${(e.definition ?? "").slice(0, 55)}`);
}

if (process.env.THEME_DEBUG) {
  for (const id of process.env.THEME_DEBUG.split(",")) {
    console.log(id, "->", assigned[id], "via", hitKw[id]);
  }
}
writeFileSync(
  path.join(ROOT, "data/theme-assignments.json"),
  JSON.stringify({ themes: THEMES, assignments: assigned }, null, 2) + "\n",
  "utf8",
);
console.log("\ndata/theme-assignments.json 저장");
