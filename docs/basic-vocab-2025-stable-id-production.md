# 3B-1A — 2025 기본어휘 Stable ID production 도입

3A(`docs/basic-vocab-2025-stable-id-design.md`)에서 설계한 stable ID를
실제 `scripts/extract_jeju_basic_vocab_2025.py`/`vocab.json`에
도입했다. **`content/lexemes.json`의 655개 `bookMeta.bookId`는 이번
단계에서 아직 바꾸지 않았다** — stable ID 인프라 자체를 먼저 검증하고,
실제 content reference 마이그레이션은 3B-1B에서 진행한다.

## 1. 결론

Stable ID production 도입에 **성공**했다. `stable-id-registry.json`을
신설해 1,501개 전부를 해석(resolve)했고, 재추출 2회에서 발급된
stableId가 전부 동일했다(신규 발급 0). 삽입·좌표 흔들림(jitter)·
PUA/표기/뜻풀이 수정·PDF 교체 시나리오까지 프로덕션 resolver
코드로 직접 시뮬레이션해 identity가 유지되거나(의도한 경우) 정확히
새 id/실패로 처리됨을 확인했다. `content/*`는 전혀 건드리지 않았다.

## 2. 최종 schema

```json
{
  "standard_raw": "다리1",
  "jeju_forms": ["가달"],
  "definition": "사람이나 동물의 몸통 아래에 붙어, 서고 걷고 뛰는 일을 하는 신체 부위.",
  "level": "초급",
  "pos": "명사",
  "chapter_no": 1,
  "pdf_page": 8,
  "id": "jbv2025-0001",
  "contains_pua": false,
  "has_standard_equivalent": true,
  "standard": ["다리"],
  "standard_homograph_no": 1,
  "sourceLocator": {
    "document": "jeju-basic-vocab-2025",
    "pdfPage": 8,
    "half": "left",
    "yStart": 86.6
  },
  "stableId": "jbv2025-p008l-y00866"
}
```

- `id`(순번 기반) — **삭제하지 않았다.** 하위 호환용 legacy 필드로
  남긴다. 새 데이터는 이 값을 영구 참조하면 안 된다.
- `sourceLocator` — 현재 extractor가 이 entry를 PDF에서 찾은 위치
  (provenance). 좌표 추출 방식이 바뀌면 미세하게 달라질 수 있다.
- `stableId` — 다른 데이터가 영구 참조할 불변 식별자.
  `stable-id-registry.json`에 한 번 발급되면 보존되고, 재추출 시
  "다시 계산"이 아니라 "기존 발급 기록과 대조해서 재사용"한다(3절).

## 3. Registry 구조와 resolver

`data/jeju-basic-vocab-2025/stable-id-registry.json`:

```json
{
  "schemaVersion": 1,
  "source": { "document": "jeju-basic-vocab-2025", "pdfSha256": "58eb1d9f..." },
  "entries": [
    { "stableId": "jbv2025-p008l-y00866", "sourceLocator": {...}, "status": "active" }
  ]
}
```

`resolve_stable_ids()`(`scripts/extract_jeju_basic_vocab_2025.py`)의
resolver 절차:

1. **registry가 없으면(최초 실행) 부트스트랩** — 현재 추출 결과
   전부에 `seed_stable_id(locator)`(좌표 문자열화)로 새 id를 발급하고
   registry를 만든다. collision이 있으면(같은 좌표) 즉시 실패한다.
2. **registry가 있으면 PDF 해시부터 확인** — `source.pdf`의 SHA256이
   registry와 다르면 이 PDF는 다른 판본이라는 뜻이므로 좌표 기반
   재사용이 안전하지 않다고 보고 **즉시 멈춘다**(`SOURCE_PDF_CHANGED`).
3. **exact locator match** — `(pdfPage, half, yStart)`가 정확히 같은
   registry entry가 있으면 그 stableId를 재사용.
4. **near locator match** — 없으면 같은 `(pdfPage, half)` 안에서
   `NEAR_LOCATOR_TOLERANCE_PT`(2.0pt) 이내로 가까운 registry entry를
   찾는다. 정확히 1개면 재사용(좌표 추출이 미세하게 흔들린 경우),
   0개면 새로 발급.
5. **ambiguity stop** — 후보가 2개 이상이면 어느 쪽인지 판단할 수
   없으므로 **조용히 아무거나 고르지 않고 즉시 실패한다**
   (`AMBIGUOUS_STABLE_ID_RESOLUTION`) — 기존 entry의 identity를
   잘못 바꾸는 것보다 빌드가 멈추는 게 안전하다.
6. **orphan 보존** — registry에는 있었는데 이번 추출에 없는 entry는
   조용히 지우지 않고 `status: "orphaned"`로 남긴다(history 역할).

`NEAR_LOCATOR_TOLERANCE_PT = 2.0`의 근거: 같은 `(pdfPage, half)` 안에서
서로 다른 entry의 y좌표 간 **문서 전체 최소 간격을 직접 측정하니
50.5pt**였다(가장 촘촘한 경우, p.148 우측). 2.0pt는 그 절반의
1/12 수준이라, 좌표 추출 라이브러리가 바뀌어도 서로 다른 entry를
혼동할 위험 없이 미세한 흔들림만 흡수한다.

## 4. 수량

| 항목 | 결과 |
|---|--:|
| entries | 1,501 |
| stableId | 1,501 |
| unique stableId | 1,501 |
| registry active | 1,501 |
| collision | 0 |
| unresolved(ambiguous) | 0 |
| orphan | 0 |

## 5. 안정성 시험

프로덕션 `resolve_stable_ids()` 함수를 직접 호출해서 시험했다(scratch
스크립트로 호출, 저장소에는 커밋하지 않음 — 재현 방법은 8절).

| 시험 | 결과 |
|---|---|
| 연속 2회 실행(동일 환경) | `vocab.json` SHA256 동일, `stable-id-registry.json` SHA256 동일, 신규 발급 0 |
| insertion(레벨 구분자 필터를 약화해 7개 spurious entry가 재등장, 1,501→1,508) | 기존 1,501개 stableId 전부 registry에서 재사용(변경 0), 새 7개만 신규 발급, orphan 0 |
| coordinate jitter(1,501개 전체 yStart를 ±0.1~0.3pt 무작위 이동) | **1,501/1,501 전부 기존 stableId로 재해석**(near-match) |
| coordinate 큰 이동(한 entry를 +40pt 이동 — 최소 entry 간격 50.5pt보다 작지만 tolerance 2.0pt보다 훨씬 큼) | 기존 id를 재사용하지 않고 새 id 발급(의도한 동작 — 이 정도 이동이면 진짜 다른 위치의 entry일 수 있으므로 근처 entry의 identity를 함부로 훔치지 않는다) |
| ambiguity(합성 테스트: 3.0pt 떨어진 두 registry entry 사이 1.5pt 지점에 현재 entry 배치) | `AMBIGUOUS_STABLE_ID_RESOLUTION`으로 즉시 실패(정확히 의도한 동작) |
| deletion(registry 마지막 5개를 현재 추출에서 제외) | 5개가 `orphaned`로 보존됨, 나머지 1,496개는 `active` 유지, registry row 총합 1,501 그대로(조용히 삭제 안 됨) |
| PUA/표기/뜻풀이/표준어 변경(1,501개 전체 텍스트 필드를 임의로 바꿔치기, sourceLocator는 유지) | 1,501/1,501 stableId 전부 불변(resolver가 텍스트를 전혀 보지 않으므로 당연한 결과) |
| PDF 해시 변경(registry의 `pdfSha256`을 임의 값으로 교체) | `SOURCE_PDF_CHANGED`로 즉시 실패 |

## 6. 3A 산출물 호환성

- `content-migration-mapping-3a.json`(655건) stableId 일치: **655/655**
- `content-new-candidates-3a.json`(71건) stableId 일치: **71/71**
- `content-source-gaps-3a.json`(1건) stableId 일치: **1/1**

3A에서 미리 계산해둔 stableId(3A 설계 문서의 `4절` 포맷을 그대로
따름)가 이번 production 부트스트랩 결과와 정확히 일치했다 — 3A
산출물을 다시 만들 필요가 없다.

## 7. 변경 파일

- `scripts/extract_jeju_basic_vocab_2025.py` — `sourceLocator`/`stableId`
  생성 및 registry resolver 추가(`build_source_locators`,
  `compute_pdf_sha256`, `seed_stable_id`, `load_registry`,
  `resolve_stable_ids`), `main()`에 배선
- `scripts/extract_jeju_basic_vocab_2025.test.mjs` — stable ID 관련
  회귀 테스트 4개 추가(고유성/registry 일치/id-stableId 분리/3A
  산출물 호환성)
- `data/jeju-basic-vocab-2025/vocab.json` — 재생성(모든 entry에
  `sourceLocator`/`stableId` 추가, 기존 필드는 그대로)
- `data/jeju-basic-vocab-2025/stable-id-registry.json` — 신규, 최초
  부트스트랩 결과(1,501개 active)

`content/lexemes.json`, `content/units.json`, `content/examples.json`,
`src/data/units.json`, `src/lib/*`, `src/routes/*`, `public/audio/*`는
건드리지 않았다. `data/jeju-basic-vocab-2025/vocab.md`는 표시 필드가
안 바뀌어서 내용 변경 없음.

## 8. 재현 방법(시뮬레이션)

프로덕션 함수를 직접 import해서 호출하면 된다(파이썬+pymupdf 필요):

```python
import sys; sys.path.insert(0, "scripts")
import extract_jeju_basic_vocab_2025 as mod

registry = mod.load_registry()  # 커밋된 registry
pdf_sha256 = registry["source"]["pdfSha256"]

# jitter 예시
import copy, random
entries = []
for r in registry["entries"]:
    loc = copy.deepcopy(r["sourceLocator"])
    loc["yStart"] = round(loc["yStart"] + random.choice([-0.3, -0.1, 0.1, 0.3]), 1)
    entries.append({"sourceLocator": loc})

stable_ids, new_registry = mod.resolve_stable_ids(entries, registry, pdf_sha256)
```

production 파일을 건드리지 않으려면 `mod.REGISTRY_PATH`를 임시
경로로 바꿔서 실행한다(`shutil.copy`로 복사 후 교체).

## 9. 테스트

- `node --test scripts/extract_jeju_basic_vocab_2025.test.mjs`: **20/20 통과**
- `npx tsc --noEmit`: 통과
- `npx eslint .`: 0 errors(기존 warning 5건 무관)
- `npx vitest run`: 42/42 통과
- `node --test 'scripts/**/*.test.mjs'`: 204/213 통과(실패 9건은 이번
  작업과 무관한 기존 실패, og:title/share-card 관련 — 2.5단계 때와
  동일한 9건)

## 10. Git

- branch: `codex/basic-vocab-stable-id-production`
- commit: 이 문서와 같은 커밋(SHA는 push 후 확인)
- PR: 생성 후 URL 기재 — **merge하지 않음**

## 11. 다음 단계 가능 여부

### READY

Stable ID production 원장이 확정됐으며, 다음 단계(3B-1B)에서 기존
content 655개의 `bookId`/`bookMeta` reference만 안전하게
마이그레이션할 수 있습니다. `partOfSpeech`(B 42건, 3B-2)와 신규
71개(3C)는 여전히 손대지 않았습니다.
