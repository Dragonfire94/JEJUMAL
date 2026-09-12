# 3C-3B.2 — `U+E56E → ᄆᆞᆷ` PUA 매핑 실제 반영 및 재현성 검증

> 이 단계는 3C-3B.1(`RESOLVED_HIGH`)에서 확정된 매핑 하나만
> 재현 가능한 pipeline으로 실제 반영한다. 다른 medium/low/unresolved
> PUA는 건드리지 않는다. Culture Track 구현 자체는 이번에도 시작하지
> 않는다.

## PR #14 검증

| 항목 | 기대값 | 실제값 | 일치 |
| --- | --- | --- | --- |
| state | open | open | ✅ |
| mergeable | true | `mergeable_state: clean` | ✅ |
| head sha | `7683fd943f49f4dffb80027ce01b386efb345238` | `7683fd943f49f4dffb80027ce01b386efb345238` | ✅ |
| commits | 1 | 1 | ✅ |
| changed files | 3개(docs/3c3b1-pua-e56e-audit.md, data/jeju-basic-vocab-2025/pua-e56e-audit-3c3b1.json, data/jeju-basic-vocab-2025/review-images/pua-e56e-crop-p63l.png) | 정확히 그 3개 | ✅ |

전부 일치해 **PR #14를 merge**했다(merge commit
`71bf77068b7469592e1fd1d809c906840e15877d`). `main`을 fetch +
`--ff-only`로 동기화하고 `codex/3c3b2-apply-pua-e56e` 브랜치를 새로
팠다.

## 1. 적용 전 raw target 재확인 (D-1, D-2)

```text
vocab.json[jbv2025-p063l-y00581].jeju_forms[0] codepoints:
  [0] U+E56E (PUA)
  [1] U+AD6D (국)
contains_pua: true
```

3C-3B.1과 동일 — 변화 없음을 확인했다.

`pua-glyph-mapping.json` 81건 전체에서 `U+E56E` 재검색 → 0건(중복
row 없음, 다른 브랜치 변화도 없음).

## 2. 적용 pipeline 판정 (D-3)

**CASE A** — 이미 재현 가능한 mechanism이 존재한다.

`scripts/extract_jeju_basic_vocab_2025.py`:

```python
def load_high_confidence_pua_map():
    # pua-glyph-mapping.json에서 confidence: "high"인 행만 로드
def apply_high_confidence_pua(text, pua_map): ...
def restore_known_pua(entries, pua_map):
    # 재추출된 entries에 high 매핑을 다시 적용

# main()
restore_known_pua(entries, load_high_confidence_pua_map())
build_entry_fields(entries)     # contains_pua를 이 시점에 재계산
build_source_locators(entries)  # 좌표 기반, 텍스트 변경과 무관
resolve_stable_ids(entries, registry, pdf_sha256)  # 좌표 기반, stableId 불변
```

즉 `pua-glyph-mapping.json`에 `confidence: "high"` 행을 추가하고
extractor를 재실행하기만 하면, PDF를 다시 읽어도 이미 확정된 표기가
자동으로 복원되고 `contains_pua`도 텍스트 치환 **이후** 재계산된다.
`build_source_locators`/`resolve_stable_ids`는 좌표(y-position) 기반이라
텍스트 내용과 무관 — stableId가 바뀌지 않는다는 것도 코드 구조로
확인했다. 별도 apply script를 새로 만들 필요가 없었다(CASE B/C
해당 없음).

## 3. Mapping row 추가 (D-4)

`pua-glyph-mapping.json`에 기존 필드 구조를 그대로 따라 1행만
추가했다:

```json
{
  "pua": "U+E56E",
  "reading": "ᄆᆞᆷ",
  "confidence": "high",
  "note": "'ᄆᆞᆷ'(모자반, 몸국의 '몸') — 3C-3B.1 감사에서 PDF 크롭·2025
    definition·AI Hub 말뭉치·위키백과/나무위키 4개 독립 근거로 확정.
    docs/3c3b1-pua-e56e-audit.md 참고.",
  "context_form": "국"  // 실제로는 U+E56E+국, 터미널엔 국으로만 보임
  "context_standard": ["모자반국"],
  "occurrences_in_book": 1,
  "sample_page": 63
}
```

`reading`은 **원자 단위**로 `ᄆᆞᆷ`(U+1106 U+119E U+11B7) 3개
codepoint만 담았다 — 뒤에 붙는 평문 `국`(U+AD6D)은 포함하지 않았다.
`apply_high_confidence_pua`는 `text.replace(pua_char, reading)`로
단순 치환하므로, `reading`에 `국`까지 넣었다면 원문의 `국`과 합쳐져
`ᄆᆞᆷ국국`처럼 중복됐을 것이다 — A-3의 경고를 그대로 지켰다.

## 4. target occurrences 전체 확인 (D-5)

`vocab.json`(1,501개 entry, `jeju_forms`/`definition`/`standard_raw`/
`standard` 전 필드) 재스캔 결과 `U+E56E`는 **정확히 1회**만
등장한다(`jbv2025-p063l-y00581` 단독). 여러 occurrence를 각각
검토할 필요가 없었다 — `same glyph identity` 판단 자체가 불필요.

## 5. `vocab.json` 반영 (D-6, D-7)

canonical 재추출 명령(`data/jeju-basic-vocab-2025/README.md`):

```bash
python scripts/extract_jeju_basic_vocab_2025.py
```

실행 결과:

```text
stable id: 기존 registry와 대조 — active 1501개(그 중 새로 발급 0개), orphaned 0개
항목 1501개(PUA 포함 58개, 표준어 대응 없음 246개), 역인덱스 1276개
```

target entry의 field-level diff(전/후, 다른 모든 필드는 완전히
동일함을 직접 대조):

```text
jeju_forms:   ["국"(=U+E56E+U+AD6D)] → ["ᄆᆞᆷ국"]
contains_pua: true → false   (build_entry_fields가 자동 재계산)

변화 없음: stableId, id(legacy), level, pos, definition,
  sourceLocator, standard, standard_raw, has_standard_equivalent,
  standard_homograph_no, chapter_no, pdf_page
```

`contains_pua`를 수동으로 고치지 않았다 — extractor가 텍스트 치환
후 자동 재계산한 값을 그대로 썼다(D-7 요구사항 그대로: 다른 PUA가
없으므로 true→false로 정확히 떨어짐, 추측이 아니라 codepoint 스캔
결과).

## 6. Reproducibility / target-only diff 증명 (D-8, D-9, D-10)

재생성된 `vocab.json`과 재생성 직전 스냅샷을 `stableId` 기준으로
전수 대조했다:

```text
entries: 1501 → 1501 (불변)
unique stableId: 1501 → 1501 (불변, 집합 자체가 완전히 동일 — set(before)==set(after))
stableId collisions: 0
변경된 entry 수: 1 (jbv2025-p063l-y00581만)
```

`stable-id-registry.json`은 재생성 전후로 **byte-identical**(diff
0)이었다 — 이번 변경이 stable ID 인프라를 전혀 건드리지 않았음을
직접 증명한다.

target 외 unrelated entry의 text/ID/sourceLocator/definition/POS
변화는 0건이다(위 stableId 기준 전수 대조로 확인). JSON
formatting/order도 기존 파이프라인이 그대로 재생성한 것이라 대규모
포맷 diff는 없었다 — 실제 `git diff` 결과 이 파일의 변경 라인은
정확히 target entry의 2개 필드뿐이었다(부수적으로 `vocab.json`
상단의 `puaCaveat` 요약 문구 속 "59개"→"58개" 카운트 한 곳도
자동으로 갱신됨 — 이 역시 target 변경의 직접 파생 효과다).

## 7. 파생 artifact 갱신 (D-11)

target `sourceStableId`/`stable_id`를 raw PUA로 저장하고 있던
현재 사용 중인(historical하지 않은) artifact 3개만 최소 갱신했다
— decision/score/usageEvidence는 손대지 않고 표기 필드만 고쳤다:

| artifact | 변경 필드 | 변경 안 한 것 |
| --- | --- | --- |
| `data/jeju-basic-vocab-2025/content-new-candidates-3a.json` | `jeju_forms: ["국"] → ["ᄆᆞᆷ국"]` | 다른 모든 필드 |
| `data/jeju-basic-vocab-2025/new-candidates-living-audit-3c1.json` | `jejuForms: ["국"] → ["ᄆᆞᆷ국"]` | `decision`(CULTURE_ADD 유지), `score`(40 유지), `usageEvidence`(NONE 유지), `evidence`/`assessment`/`decisionBasis` 등 전부 |
| `data/jeju-basic-vocab-2025/culture-track-proposal-3c3b.json` | `items[].jeju: "국"→"ᄆᆞᆷ국"`, `items[].containsPua: true→false`, `puaFindings[0]`을 해소 상태로 갱신 | `learnerGloss`(여전히 `null`/`pendingGloss: true`, 이번에도 짓지 않음), `linguisticType`, `usageEvidenceRef` 등 |

`data/jeju-basic-vocab-2025/pua-e56e-audit-3c3b1.json`,
`docs/3c3b1-pua-e56e-audit.md`, 리뷰 크롭 이미지는 **역사적 판정
기록**이므로 원본 그대로 보존했다(raw before = U+E56E, recommended =
ᄆᆞᆷ이라는 기록을 지우거나 "이미 적용된 것처럼" 덮어쓰지 않음) — 이
문서(3c3b2)가 그 적용 상태를 별도로 기록한다(D-12).

## 8. Main production 영향 (D-13)

이번 target은 main lexeme으로 반영된 적이 없어(3C-3B 설계 문서 §8의
"existing main overlaps: 0/25" 그대로) 기본 기대가 그대로 성립했다:

```text
content/lexemes.json diff = 0
content/units.json diff = 0
content/examples.json diff = 0
src/data/units.json diff = 0
```

`U+E56E`가 다른 main lexeme에서 쓰인다는 사실도 발견되지 않았다(4절
전수 스캔이 `vocab.json` 전체를 이미 커버했고, main lexeme은 이
2025 source에서만 파생되므로 이 스캔으로 충분하다).

## 9. Mapping regression test 추가 (D-14)

`scripts/extract_jeju_basic_vocab_2025.test.mjs`에 기존 "PUA 매핑
확정본이 재추출 후에도 유지된다" 테스트 바로 다음에 전용 테스트를
추가했다:

```text
"U+E56E 매핑이 재추출 후에도 정확히 'ᄆᆞᆷ국'으로 유지되고 중복되지 않는다"
- jeju_forms가 정확히 ["ᄆᆞᆷ국"]인지
- contains_pua가 false인지
- 치환 후에도 PUA 범위(U+E000–F8FF) 문자가 남아있지 않은지
- "국국"처럼 평문이 중복되지 않았는지
```

새 테스트 프레임워크를 만들지 않고 기존 파일에 자연스럽게 추가했다.

## 10. PUA inventory (D-15, D-16)

**적용 전**(3C-3B.1 시점, 재확인):

```text
vocab.json 전체 재스캔 기준 unique PUA: 24개
pua-glyph-mapping.json rows: 81 (high 58 / medium 16 / low 7)
unmapped unique PUA: 1개 (U+E56E)
```

**적용 후**(이번 단계):

```text
vocab.json 전체 재스캔 기준 unique PUA: 23개
pua-glyph-mapping.json rows: 82 (high 59 / medium 16 / low 7)
unmapped unique PUA: 0개
U+E56E remaining in vocab.json: 0개
```

medium 16개·low 7개는 이번 단계에서 전혀 건드리지 않았다(변화 없음
그대로 재확인) — 이 mapping 때문에 다른 unresolved PUA가 우연히
해소된 것은 아니다.

`data/jeju-basic-vocab-2025/README-pua-mapping.md`는 원래 "81개
고유 glyph"라는 **당시 스캔 모집단(초중급 298개 표제어) 기준**
역사적 사실을 담고 있어 그 숫자 자체는 고치지 않고, 문서 끝에
"추가 발견 — U+E56E" 절만 추가해 이번 3C-3B.1/3C-3B.2에서 그 81개
밖의 새 glyph 1건을 찾아 해소했다는 사실과 현재 정확한 수치(82행,
high 59/medium 16/low 7, 미매핑 0)를 남겼다.

## 11. Culture proposal target 확인 (D-17)

`culture-track-proposal-3c3b.json`의 `culture-12`(sourceStableId
`jbv2025-p063l-y00581`) 항목:

```text
jeju: "ᄆᆞᆷ국" ✅
containsPua: false ✅
```

Culture MVP 구현 시 이 항목을 PUA 때문에 blocked/excluded 처리할
필요가 이제 없다.

## Production impact

```text
content/lexemes.json changed = 0
content/units.json changed = 0
content/examples.json changed = 0
src/data/units.json changed = 0
```

## Git

- PR #14 merge commit: `71bf77068b7469592e1fd1d809c906840e15877d`
- 작업 브랜치: `codex/3c3b2-apply-pua-e56e`

## 다음 단계

### READY

> `U+E56E → ᄆᆞᆷ` 복원이 `pua-glyph-mapping.json`/extractor
> pipeline에 재현 가능하게 반영됐고, `vocab.json`·Culture proposal·
> 관련 audit artifact가 모두 `ᄆᆞᆷ국` 표기로 일관되게 정리됐습니다.
> 재추출 시 stableId·registry·main production 어느 것도 변하지
> 않음을 직접 증명했습니다. 사용자 승인 후 PR을 병합하고 Culture
> Track 최소 구현(3C-3C)으로 넘어갈 수 있습니다.
