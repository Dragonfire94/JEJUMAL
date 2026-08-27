#!/usr/bin/env python3
"""Build short textbook examples.

Write a clear standard-Korean sentence, then render the same sentence in Jeju:
every dictionary word plus 해요체 endings (수다/우다/옵서). The Korean line
stays next to it as the meaning.
"""

from __future__ import annotations

import json
import re
import sys
from itertools import product
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from assemble_examples import (  # noqa: E402
    NOUN_PARTICLES,
    has_batchim,
    particle_for,
    split_noun_particle,
)
from extract_aihub_examples import UNITS_PATH, OUT_PATH  # noqa: E402

POLITE = {
    "가다": "가요",
    "오다": "와요",
    "하다": "해요",
    "되다": "돼요",
    "이다": "이에요",
    "많다": "많아요",
    "크다": "커요",
    "돕다": "도와요",
    "굽다": "구워요",
    "눕다": "누워요",
    "덥다": "더워요",
    "춥다": "추워요",
    "맵다": "매워요",
    "쉽다": "쉬워요",
    "어렵다": "어려워요",
    "가깝다": "가까워요",
    "반갑다": "반가워요",
    "듣다": "들어요",
    "묻다": "물어요",
    "낫다": "나아요",
    "붓다": "부어요",
    "긋다": "그어요",
    "부르다": "불러요",
    "모르다": "몰라요",
    "다르다": "달라요",
    "오르다": "올라요",
    "이르다": "일러요",
    "푸르다": "푸르러요",
    "기르다": "길러요",
    "누르다": "눌러요",
    "자르다": "잘라요",
    "고르다": "골라요",
    "구르다": "굴러요",
    "흐르다": "흘러요",
    "기쁘다": "기뻐요",
    "슬프다": "슬퍼요",
    "아프다": "아파요",
    "배고프다": "배고파요",
    "예쁘다": "예뻐요",
    "바쁘다": "바빠요",
    "가쁘다": "가빠져요",
    "하얗다": "하얘요",
    "까맣다": "까매요",
    "빨갛다": "빨개요",
    "노랗다": "노래요",
    "파랗다": "파래요",
    "그렇다": "그래요",
    "이렇다": "이래요",
    "저렇다": "저래요",
    "놓다": "놓아요",
    "좋다": "좋아요",
    "읽다": "읽어요",
    "앉다": "앉아요",
    "먹다": "먹어요",
    "마시다": "마셔요",
    "기다리다": "기다려요",
    "만들다": "만들어요",
    "살다": "살아요",
    "놀다": "놀아요",
    "열다": "열어요",
    "힘들다": "힘들어요",
    "쓰다": "써요",
    "켜다": "켜요",
    "켜지다": "켜져요",
    "펴다": "펴요",
    "씻다": "씻어요",
    "걷다": "걸어요",
    "닫다": "닫아요",
    "붙다": "붙어요",
    "붙이다": "붙여요",
    "보이다": "보여요",
    "깨다": "깨요",
    "깨우다": "깨워요",
    "시키다": "시켜요",
    "담그다": "담가요",
    "넘기다": "넘겨요",
    "남기다": "남겨요",
    "늘리다": "늘려요",
    "멈추다": "멈춰요",
    "모으다": "모아요",
    "모이다": "모여요",
    "싸우다": "싸워요",
    "내버리다": "내버려요",
    "내놓다": "내놓아요",
    "나무라다": "나무래요",
    "나르다": "날라요",
    "머물다": "머물러요",
    "메우다": "메워요",
    "뒤집다": "뒤집어요",
    "뒹굴다": "뒹굴어요",
    "떨어지다": "떨어져요",
    "벗기다": "벗겨요",
    "비키다": "비켜요",
    "밀다": "밀어요",
    "바르다": "발라요",
    "베다": "베어요",
    "고치다": "고쳐요",
    "길들이다": "길들여요",
    "끝내다": "끝나요",
    "패다": "패요",
    "짚다": "짚어요",
    "쥐다": "쥐어요",
    "쌓다": "쌓아요",
    "던지다": "던져요",
    "줍다": "주워요",
    "얼다": "얼어요",
    "속다": "속아요",
    "잡다": "잡아요",
    "싣다": "실어요",
    "쇠다": "쇠어요",
    "뻗다": "뻗어요",
    "덮다": "덮어요",
    "뱉다": "뱉어요",
    "낚다": "낚아요",
    "꿰다": "꿰요",
    "흔들다": "흔들어요",
    "흔든다": "흔들어요",
    "흘리다": "흘려요",
    "후리다": "후려요",
    "헹구다": "헹궈요",
    "풍기다": "풍겨요",
    "끄르다": "끌러요",
    "태우다": "태워요",
    "치받다": "치받아요",
    "주치다": "주쳐요",
    "저물다": "저물어요",
    "적시다": "적셔요",
    "입히다": "입혀요",
    "성내다": "성내요",
    "성나다": "성나요",
    "업히다": "업혀요",
    "얼르다": "얼러요",
    "잡히다": "잡혀요",
    "섬기다": "섬겨요",
    "서르다": "서러요",
    "맡다": "맡아요",
    "맡기다": "맡겨요",
    "묵다": "묵어요",
    "묶다": "묶어요",
    "매다": "매요",
    "들다": "들어요",
    "캐다": "캐요",
    "희다": "희어요",
    "깊다": "깊어요",
    "넓다": "넓어요",
    "졸리다": "졸려요",
    "무르다": "물러요",
    "똑똑하다": "똑똑해요",
    "선선하다": "선선해요",
    "작다": "작아요",
    "나쁘다": "나빠요",
    "굵다": "굵어요",
    "뜨겁다": "뜨거워요",
    "귀엽다": "귀여워요",
    "싫다": "싫어요",
    "두껍다": "두꺼워요",
    "가볍다": "가벼워요",
    "같다": "같아요",
    "무겁다": "무거워요",
    "모자라다": "모자라요",
    "부드럽다": "부드러워요",
    "드물다": "드물어요",
    "여리다": "여려요",
    "사납다": "사나워요",
    "세다": "세요",
    "낡다": "낡아요",
    "떫다": "떫어요",
    "길다": "길어요",
    "높다": "높아요",
    "엄하다": "엄해요",
    "여위다": "여위어요",
    "성기다": "성겨요",
    "별나다": "별나요",
    "푸짐하다": "푸짐해요",
    "고단하다": "고단해요",
    "미끈하다": "미끈해요",
    "추잡스럽다": "추잡스러워요",
    "이상스럽다": "이상스러워요",
    "웃다": "웃어요",
    "욕다": "욕어요",
}


def polite(lemma: str) -> str:
    lemma = lemma.strip()
    if lemma in POLITE:
        return POLITE[lemma]
    if lemma.endswith("스럽다"):
        return lemma[:-3] + "스러워요"
    if " " in lemma or len(lemma) > 8:
        return lemma
    if not lemma.endswith("다"):
        return lemma
    stem = lemma[:-1]
    if stem.endswith("하"):
        return stem[:-1] + "해요"
    if stem.endswith("르") and len(stem) >= 2:
        return stem[:-1] + "라요"
    last = stem[-1]
    code = ord(last)
    if not (0xAC00 <= code <= 0xD7A3):
        return stem + "어요"
    jong = (code - 0xAC00) % 28
    vow = ((code - 0xAC00) // 28) % 21
    if jong == 0 and vow in {0, 8}:  # ㅏ ㅗ
        if last == "가":
            return stem + "요"
        if last == "오":
            return stem[:-1] + "와요"
        return stem + "아요"
    return stem + "어요"


def attach(lemma: str, kind: str) -> str:
    particle = {
        "subj": "가",
        "obj": "를",
        "top": "는",
        "and": "와",
        "loc": "에",
        "from": "에서",
        "also": "도",
        "only": "만",
        "like": "처럼",
        "to": "에게",
        "ie": "예요",
    }[kind]
    if kind == "ie":
        return lemma + ("이에요" if has_batchim(lemma) else "예요")
    return lemma + particle_for(lemma, particle)


# Glue that the 1,000-word reverse lexicon misses, plus 1-character headwords
# skipped by default. EXTRA wins over the reverse lexicon for these keys.
EXTRA_LEXICON = {
    "엄마": "어멍",
    "아버지": "아방",
    "어머니": "어멍",
    "할아버지": "하르방",
    "할머니": "할망",
    "아내": "각씨",
    "남편": "냄편",
    "부엌": "정지",
    "집": "짓",
    "길": "질",
    "꽃": "고장",
    "가게": "절간",
    "사람": "사름",
    "아침": "아적",
    "저녁": "저냑",
    "점심": "낮밥",
    "내일": "닐",
    "바다": "바당",
    "나무": "낭",
    "돌": "돗",
    "책": "척",
    "손님": "나그네",
    "왜": "무사",
    "너": "느",
    "비": "주제",
    "해": "헤",
    "풀": "쿨",
    "바람": "바름",
    "오래": "오라",
    "같이": "가치",
    "먼저": "먼젓",
    "천천히": "슬슬",
    "급하게": "급허게",
    "그렇게": "경",
    "이렇게": "영",
    "이쪽으로": "이디로",
    "여기": "이디",
    "거기": "그디",
    "저기": "저디",
    "어디": "어디",
    "누구": "누게",
    "뭐": "무신거",
    "오늘": "오널",
    "아이": "아이",
    "물": "물",
    "밥": "밥",
    "하다": "허다",
    "있다": "싯다",
    "없다": "엇다",
    "먹다": "먹다",
    "보다": "보다",
    "가다": "가다",
    "오다": "오다",
    "말하다": "말허다",
    "마시다": "드르쓰다",
    "기다리다": "지드리다",
    "돕다": "도왜다",
    "씻다": "싯다",
    "걷다": "귿다",
    "열다": "욜다",
    "앉다": "앚다",
    "시키다": "시기다",
}

# Longest first. Applied before token split so multi-word Korean is Jeju too.
PHRASE_PAIRS = [
    ("이쪽으로", "이디로"),
    ("해 질 녘에", "헤 질 녘에"),
    ("비 온 뒤에", "주제 온 뒤에"),
    ("나무 아래에서", "낭 아래에서"),
    ("사람들 앞에서", "사름들 앞에서"),
    ("바닷가에서", "바당가에서"),
    ("풀밭에서", "쿨밧에서"),
    ("뭐예요", "무신거우다"),
    ("누구 거예요", "누게 거우다"),
    ("얼마예요", "얼마우다"),
    ("돌 틈에서", "돗 틈에서"),
    ("급하게", "급허게"),
    ("그렇게", "경"),
    ("이렇게", "영"),
]

# Token suffixes, longest first. Never substring-replace across a whole sentence
# (도와요 contains 와요).
ENDING_RULES = [
    ("으세요", "읍서"),
    ("십시오", "십서"),
    ("보세요", "봅서"),
    ("오세요", "옵서"),
    ("가세요", "갑서"),
    ("세요", "십서"),
    ("았어요", "안"),
    ("었어요", "언"),
    ("였어요", "연"),
    ("했어요", "핸"),
    ("갔어요", "가언"),
    ("왔어요", "오언"),
    ("이에요", "우다"),
    ("예요", "우다"),
    ("있어요", "이심수다"),
    ("없어요", "엇수다"),
    ("도와요", "도왜암수다"),
    ("스러워요", "스럼수다"),
    ("해요", "햄수다"),
    ("가요", "갑수다"),
    ("와요", "옵수다"),
    ("봐요", "봄수다"),
    ("져요", "점수다"),
    ("켜요", "켬수다"),
    ("셔요", "심수다"),
    ("혀요", "험수다"),
    ("려요", "렴수다"),
    ("러요", "럼수다"),
    ("여요", "염수다"),
    ("워요", "움수다"),
    ("어요", "엄수다"),
    ("아요", "암수다"),
]

KEEP_YO = {"아니요", "요"}
ALLOW_ONE = {"너", "해", "집", "길", "꽃", "책", "돌", "왜", "비", "풀"}
SKIP_STD = {"것", "거", "때", "곳", "중", "앞", "뒤", "위"}
ATOM_RE = re.compile(r"[가-힣A-Za-z0-9]+")
MIEUM = 16


def display_std(std: str) -> str:
    return std.replace("-", "").replace(">", "").replace("<", "").strip()


def apply_phrases(text: str) -> str:
    for old, new in PHRASE_PAIRS:
        if old in text:
            text = text.replace(old, new)
    return text


def with_mieum_suda(stem: str) -> str:
    if not stem:
        return "수다"
    last = stem[-1]
    code = ord(last)
    if not (0xAC00 <= code <= 0xD7A3):
        return stem + "수다"
    base = code - 0xAC00
    cho, jung, jong = base // 588, (base % 588) // 28, base % 28
    if jong == 0:
        return stem[:-1] + chr(0xAC00 + cho * 588 + jung * 28 + MIEUM) + "수다"
    return stem + "엄수다"


def convert_token_ending(token: str) -> str:
    if token in KEEP_YO:
        return token
    for old, new in ENDING_RULES:
        if token.endswith(old):
            return token[: -len(old)] + new
    if token.endswith("요") and len(token) >= 2:
        return with_mieum_suda(token[:-1])
    return token


def convert_endings(text: str) -> str:
    bits = ATOM_RE.split(text)
    tokens = ATOM_RE.findall(text)
    out: list[str] = []
    idx = 0
    for bit in bits:
        out.append(bit)
        if idx < len(tokens):
            out.append(convert_token_ending(tokens[idx]))
            idx += 1
    return "".join(out)


def to_past_surface(polite_form: str) -> str:
    for now, past in (
        ("해요", "했어요"),
        ("어요", "었어요"),
        ("아요", "았어요"),
        ("여요", "였어요"),
        ("워요", "웠어요"),
        ("셔요", "셨어요"),
        ("가요", "갔어요"),
        ("와요", "왔어요"),
        ("봐요", "봤어요"),
        ("요", "었어요"),
    ):
        if polite_form.endswith(now):
            return polite_form[: -len(now)] + past
    return polite_form


def pick_jeju(cands: list[str]) -> str:
    filtered = [item for item in cands if len(item) >= 2] or list(cands)
    return sorted(filtered, key=lambda item: (len(item), item))[0]


GENERIC_JEJU = {"하다", "허다", "있다", "싯다", "되다"}


def add_verb_forms(lex: dict[str, str], std: str, jeju: str) -> None:
    if " " in std or not std.endswith("다"):
        return
    ko_p = polite(std)
    je_p = convert_endings(polite(jeju))
    if jeju in GENERIC_JEJU and std not in {"하다", "있다"}:
        return
    if ko_p not in {"해요", "아요", "어요"}:
        lex[ko_p] = je_p
    lex[to_past_surface(ko_p)] = convert_endings(to_past_surface(polite(jeju)))


def build_lexicon(words: list[dict]) -> dict[str, str]:
    grouped: dict[str, list[str]] = {}
    for word in words:
        grouped.setdefault(word["standard"], []).append(word["jeju"])
    lex: dict[str, str] = {}
    for std, cands in grouped.items():
        if std in SKIP_STD:
            continue
        if len(std) < 2 and std not in ALLOW_ONE:
            continue
        jeju = pick_jeju(cands)
        if jeju in GENERIC_JEJU and std not in {"하다", "있다"}:
            continue
        lex[std] = jeju
    for word in words:
        if word["partOfSpeech"] not in {"verb", "adjective"}:
            continue
        add_verb_forms(lex, word["standard"], word["jeju"])
    lex.update(EXTRA_LEXICON)
    for std, jeju in EXTRA_LEXICON.items():
        add_verb_forms(lex, std, jeju)
    lex["앉으세요"] = "앚읍서"
    lex["앉으십시오"] = "앚읍서"
    return lex


def jeju_particle(lemma: str, particle: str) -> str:
    if particle == "에서":
        return "이서"
    if particle in {"이에요", "예요"}:
        return "우다" if has_batchim(lemma) else "우다"
    return particle_for(lemma, particle)


def replace_token(token: str, lex: dict[str, str]) -> str:
    if token in lex:
        return lex[token]
    for suf in ("이에요", "예요"):
        if token.endswith(suf) and len(token) > len(suf):
            lemma = token[: -len(suf)]
            if lemma in lex:
                return lex[lemma] + suf
    lemma, part = split_noun_particle(token, min_lemma=1)
    if part == "요":
        lemma, part = token, ""
    if lemma in lex and part:
        jeju = lex[lemma]
        return jeju + jeju_particle(jeju, part)
    particles = {
        "은",
        "는",
        "이",
        "가",
        "을",
        "를",
        "의",
        "도",
        "만",
        "과",
        "와",
        "에",
        "에서",
        "마다",
        "부터",
        "까지",
        "처럼",
        "으로",
        "로",
        "이에요",
        "예요",
    }
    for key in sorted(lex, key=len, reverse=True):
        if not token.startswith(key) or token == key:
            continue
        rest = token[len(key) :]
        jeju = lex[key]
        if rest in particles:
            return jeju + (rest if rest in {"이에요", "예요"} else jeju_particle(jeju, rest))
        if len(key) >= 2 and len(rest) <= 4:
            return jeju + rest
    return token


def head_variants(head_std: str) -> list[str]:
    out: list[str] = []
    for item in (head_std, display_std(head_std), head_std.replace("-", " ")):
        if item and item not in out:
            out.append(item)
    out.sort(key=len, reverse=True)
    return out


def replace_head(text: str, head_std: str, head_jeju: str) -> str:
    """Put the Jeju headword in before converting the rest of the sentence."""
    for variant in head_variants(head_std):
        idx = text.find(variant)
        if idx < 0:
            continue
        after = text[idx + len(variant) :]
        part = ""
        rest = after
        for particle in NOUN_PARTICLES:
            if after.startswith(particle):
                part = particle
                rest = after[len(particle) :]
                break
        swapped = head_jeju + (jeju_particle(head_jeju, part) if part else "")
        return text[:idx] + swapped + rest
    if head_std.endswith("다") and len(head_std) >= 3:
        stem = head_std[:-1]
        je_stem = head_jeju[:-1] if head_jeju.endswith("다") else head_jeju
        if stem and stem in text:
            return text.replace(stem, je_stem, 1)
    return text


def jejuize(
    korean: str,
    lex: dict[str, str],
    head_std: str,
    head_jeju: str,
    pos: str = "",
) -> str:
    text = replace_head(korean, head_std, head_jeju)
    text = apply_phrases(text)
    bits = ATOM_RE.split(text)
    tokens = ATOM_RE.findall(text)
    out: list[str] = []
    idx = 0
    for bit in bits:
        out.append(bit)
        if idx < len(tokens):
            tok = tokens[idx]
            if tok == head_jeju and pos in {"verb", "adjective"} and tok.endswith("다"):
                out.append(convert_endings(polite(tok)))
            elif tok == head_jeju or (head_jeju and tok.startswith(head_jeju)):
                out.append(tok)
            else:
                out.append(replace_token(tok, lex))
            idx += 1
    return convert_endings("".join(out))


def korean(std: str, kind: str | None, template: str) -> str:
    if kind:
        return template.format(w=attach(display_std(std), kind))
    return template.format(w=display_std(std))


def take(pool: list[str], used: set[str]) -> str:
    for item in pool:
        if item not in used:
            used.add(item)
            return item
    raise RuntimeError("predicate pool exhausted")


def noun_pools() -> dict[str, list[str]]:
    extra = ["그냥", "잠깐", "오래", "같이", "혼자", "또"]
    people_pred = [
        f"{time} {place} {how} {verb}"
        for time, place, how, verb in product(
            ["오늘", "어제", "아침에", "저녁에", "주말에"],
            ["집에서", "마당에서", "부엌에서", "길에서", "장에서", "학교에서"],
            extra,
            ["기다려요", "말해요", "쉬고 있어요", "일을 도와요", "차를 마셔요", "밥을 먹어요"],
        )
    ]
    body_pred = [
        f"{how} {verb}"
        for how, verb in product(
            ["찬물에", "따뜻한 물에", "비누로", "수건으로", "살살", "깨끗이", "오늘따라", "조금", "양손으로", "거울 앞에서"],
            ["씻어요", "닦아요", "말려요", "주물러요", "펴요", "만져 봐요", "들여다봐요", "가려요", "적셔요", "감싸요"],
        )
    ]
    food_pred = [
        f"{how} {verb}"
        for how, verb in product(
            ["냄비에", "그릇에", "상에", "아침에", "점심에", "저녁에", "찬으로", "간식으로", "불에", "소금만으로"],
            ["끓여요", "볶아요", "담가요", "올려요", "먹어요", "나눠 먹어요", "간을 맞춰요", "한 입 베어 물어요", "식혀요", "담아요"],
        )
    ]
    home_pred = [
        f"{place} {verb}"
        for place, verb in product(
            ["마루에", "방에", "부엌에", "창고에", "마당에", "벽에", "창가에", "문 앞에", "선반에", "바닥에"],
            ["두었어요", "걸었어요", "쌓아 두었어요", "고쳐요", "닦아요", "열어 두었어요", "정리해요", "새로 샀어요", "말려요", "옮겨요"],
        )
    ]
    life_pred = [
        f"{when} {verb}"
        for when, verb in product(
            ["아침에", "낮에", "저녁에", "밤에", "내일", "나중에", "주말에", "명절에", "예전에", "요즘은"],
            ["만나요", "바빠요", "쉬어요", "준비해요", "기다렸어요", "기억해요", "적어 두어요", "이야기해요", "다녀와요", "챙기겠어요"],
        )
    ]
    animal_pred = [
        f"{place} {verb}"
        for place, verb in product(
            ["마당에서", "들에서", "바닷가에서", "산에서", "우리에서", "물가에서", "나무 아래에서", "길에서", "돌 틈에서", "풀밭에서"],
            ["놀아요", "먹이를 먹어요", "지나가요", "소리를 내요", "숨어 있어요", "달려요", "날아가요", "자고 있어요", "헤엄쳐요", "따라와요"],
        )
    ]
    nature_pred = [
        f"{when} {verb}"
        for when, verb in product(
            ["새벽에", "낮에", "저녁에", "밤에", "여름에", "겨울에", "비 온 뒤에", "바람이 불면", "아침에", "해 질 녘에"],
            ["보여요", "지나가요", "내려요", "그쳤어요", "시원해요", "가득해요", "빛나요", "밀려와요", "잦아져요", "더 짙어져요"],
        )
    ]
    talk_pred = [
        f"{when} {verb}"
        for when, verb in product(
            ["지금", "아까", "내일", "갑자기", "천천히", "크게", "작게", "다시", "먼저", "나중에"],
            ["말해요", "물어봐요", "대답해요", "웃어요", "약속해요", "불러요", "적어 둬요", "생각나요", "들려줘요", "적어 보냈어요"],
        )
    ]
    char_pred = [
        f"{how} {verb}"
        for how, verb in product(
            ["마을에서", "이웃들 사이에", "집에서", "일터에서", "사람들 앞에서", "아이들과", "손님 앞에서", "밤에", "아침에", "늘"],
            ["그렇게 불려요", "자주 보여요", "잘 도와요", "이야기를 잘해요", "먼저 인사해요", "약속을 지켜요", "웃음을 줘요", "일이 많아요", "말이 적어요", "조심해야 해요"],
        )
    ]
    return {
        "people": people_pred,
        "body": body_pred,
        "food": food_pred,
        "home": home_pred,
        "life": life_pred,
        "animals": animal_pred,
        "nature": nature_pred,
        "talk": talk_pred,
        "adj": char_pred,
        "verbs": talk_pred,
    }


def adverb_pool() -> list[str]:
    return [
        f"{obj} {verb}"
        for obj, verb in product(
            ["물을", "밥을", "국을", "숙제를", "길을", "방을", "옷을", "창문을", "이야기를", "일을", "책을", "손을"],
            ["했어요", "마셨어요", "먹었어요", "열었어요", "닫았어요", "닦았어요", "읽었어요", "기다렸어요", "만났어요", "고쳤어요"],
        )
    ]


def verb_pool() -> list[str]:
    times = ["아침에", "낮에", "저녁에", "지금", "천천히", "얼른"]
    objs = [
        "책을",
        "문을",
        "창문을",
        "옷을",
        "손을",
        "밥을",
        "물을",
        "방을",
        "길을",
        "아이를",
        "가방을",
        "불을",
        "머리를",
        "신발을",
        "편지를",
        "그릇을",
        "이불을",
        "빨래를",
        "야채를",
        "약을",
        "약속을",
        "숙제를",
        "일을",
        "이야기를",
        "노래를",
        "사진을",
        "자리를",
        "설거지를",
        "이불을",
        "문을",
    ]
    return [f"{time} {obj} {{w}}" for time, obj in product(times, objs)]


def adj_pool() -> list[str]:
    times = ["오늘", "지금", "아침부터", "밤에는", "겨울에", "여름에"]
    whos = [
        "그 사람이",
        "마음이",
        "표정이",
        "성격이",
        "목소리가",
        "일이",
        "날씨가",
        "방이",
        "바다가",
        "바람이",
        "손이",
        "길이",
        "집이",
        "물이",
        "공기가",
        "하늘이",
        "아침이",
        "빛이",
        "기분이",
        "어깨가",
    ]
    return [f"{time} {who} {{w}}" for time, who in product(times, whos)]


CUSTOM = {
    "시기다": "엄마가 숙제를 시키려고 해요.",
}

SPECIAL = {
    "고장": ("subj", "마당에 {w} 노랗게 피었어요."),
    "절간": ("subj", "마을 입구에 {w} 새로 열렸어요."),
    "하영": (None, "오늘은 물을 {w} 마셨어요."),
    "각씨": ("top", "{w} 부엌에서 차를 끓여요."),
    "냄편": ("obj", "나는 {w} 저녁마다 기다려요."),
    "하르방": ("top", "{w} 마루에서 책을 봐요."),
    "어멍": ("top", "{w} 부엌에서 밥을 지어요."),
    "옵서": (None, "{w}, 이쪽으로 앉으세요."),
    "무사": (None, "{w} 그렇게 급하게 걸어요?"),
}


def build_for_word(word: dict, unit: dict, used: dict[str, set[str]], pools: dict) -> str:
    jeju, std, pos = word["jeju"], word["standard"], word["partOfSpeech"]
    theme = unit["themeId"]

    if jeju in CUSTOM:
        return CUSTOM[jeju]

    if jeju in SPECIAL:
        kind, template = SPECIAL[jeju]
        if pos in {"verb", "adjective"} and "{w}" in template:
            return template.format(w=polite(std))
        return korean(std, kind, template)

    if pos == "noun":
        pred = take(pools["noun"].get(theme, pools["noun"]["talk"]), used.setdefault(f"noun-{theme}", set()))
        if theme in {"body", "food", "home"}:
            kind = "obj"
            template = f"{{w}} {pred}."
        elif theme in {"adj", "people"}:
            kind = "top"
            template = f"{{w}} {pred}."
        elif theme in {"animals", "nature"}:
            kind = "subj"
            template = f"{{w}} {pred}."
        else:
            kind = "obj"
            template = f"나는 {{w}} {pred}."
        return korean(std, kind, template)

    if pos == "pronoun":
        pred = take(
            [
                "내 책이에요",
                "네가 말한 거예요",
                "지금 필요해요",
                "어디서 왔어요",
                "같이 가요",
                "이름이 뭐예요",
                "얼마예요",
                "잘 모르겠어요",
                "여기 있어요",
                "저기 보여요",
                "누구 거예요",
                "그게 맞아요",
                "한번 봐요",
                "천천히 말해요",
                "잘 들려요",
                "같이 앉아요",
                "먼저 가요",
            ],
            used["pronoun"],
        )
        return korean(std, "top", f"{{w}} {pred}.")

    if pos == "number":
        pred = take(
            [
                "명이 모였어요",
                "개가 남았어요",
                "번 읽었어요",
                "시가 되었어요",
                "살이에요",
                "권이 있어요",
                "걸음에 도착해요",
                "푼이 모였어요",
            ],
            used["number"],
        )
        return korean(std, "subj", f"{{w}} {pred}.")

    if pos == "adverb":
        pred = take(pools["adverb"], used["adverb"])
        obj, verb = pred.rsplit(" ", 1)
        return korean(std, None, f"오늘은 {obj} {{w}} {verb}.")

    if pos == "interjection":
        pred = take(
            [
                "이쪽으로 오세요",
                "잠깐만 기다려요",
                "내가 도와요",
                "지금은 괜찮아요",
                "내일 다시 만나요",
                "잘 부탁해요",
                "그건 아닌 것 같아요",
                "한번 생각해 봐요",
                "정말 그래요",
                "큰일 날 뻔했어요",
                "깜짝 놀랐어요",
                "천천히 다시 말해요",
                "내가 먼저 가요",
            ],
            used["intj"],
        )
        return korean(std, None, f"{{w}}, {pred}.")

    if pos == "verb":
        pred = take(pools["verb"], used["verb"])
        return pred.format(w=polite(std)) + "."

    if pos == "adjective":
        if " " in std or "-" in std:
            pred = take(
                [
                    "그 사람은 {w}.",
                    "그런 일은 {w}.",
                    "그 모양은 {w}.",
                    "마음이 {w}.",
                    "그 말은 {w}.",
                    "이 일은 {w}.",
                ],
                used["adj-phrase"],
            )
            return pred.format(w=display_std(std))
        pred = take(pools["adj"], used["adj"])
        return pred.format(w=polite(std)) + "."

    return korean(std, "ie", "이것은 {w}.")


def leftover_report(merged: list[dict]) -> None:
    yo = []
    house = []
    kitchen = []
    road = []
    so = []
    for unit in merged:
        for word in unit["words"]:
            text = word["examples"][0]["jeju"]
            tokens = ATOM_RE.findall(text)
            if any(tok.endswith("요") and tok != word["jeju"] for tok in tokens):
                yo.append((word["jeju"], text))
            if word["jeju"] != "짓" and "집에서" in text:
                house.append((word["jeju"], text))
            if "부엌" in text:
                kitchen.append((word["jeju"], text))
            if word["jeju"] != "질" and "길을" in text:
                road.append((word["jeju"], text))
            if word["jeju"] != "경" and "그렇게" in text:
                so.append((word["jeju"], text))
    print(f"leftover 요={len(yo)} 집에서={len(house)} 부엌={len(kitchen)} 길을={len(road)} 그렇게={len(so)}")
    for label, rows in (("요", yo), ("집", house), ("부엌", kitchen), ("길", road), ("그렇게", so)):
        for row in rows[:8]:
            print(f"  {label} {row[0]}: {row[1]}")


def main() -> None:
    units = json.loads(UNITS_PATH.read_text(encoding="utf-8"))
    words = [word for unit in units for word in unit["words"]]
    lex = build_lexicon(words)
    pools = {
        "noun": noun_pools(),
        "adverb": adverb_pool(),
        "verb": verb_pool(),
        "adj": adj_pool(),
    }
    used: dict[str, set[str]] = {
        "noun": set(),
        "pronoun": set(),
        "number": set(),
        "adverb": set(),
        "intj": set(),
        "verb": set(),
        "adj": set(),
        "adj-phrase": set(),
    }

    out: dict[str, list[dict]] = {}
    merged = []
    for unit in units:
        next_words = []
        for word in unit["words"]:
            item = dict(word)
            standard = build_for_word(word, unit, used, pools)
            example = {
                "jeju": jejuize(
                    standard, lex, word["standard"], word["jeju"], word["partOfSpeech"]
                ),
                "standard": standard,
            }
            item["examples"] = [example]
            out[word["seq"]] = [example]
            next_words.append(item)
        merged.append({**unit, "words": next_words})

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    UNITS_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"words {len(out)}  sentences {sum(len(v) for v in out.values())}")

    watch = ["하영", "각씨", "냄편", "옵서", "무사", "고장", "절간", "시기다", "하르방", "어멍", "아방", "사름"]
    by = {w["jeju"]: w for u in merged for w in u["words"]}
    for name in watch:
        w = by.get(name)
        print(f"  {name}: {w['examples'][0] if w else 'n/a'}")
    leftover_report(merged)


if __name__ == "__main__":
    main()
