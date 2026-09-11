# 제주말

소리로 배우는 제주어 학습 앱. 애기해녀 → 하군 → 중군 → 상군 → 대상군, 등급당 200단어.

앱이 지금 쓰는 단어는 100유닛(유닛당 8~10개, 총 989개)이고, 콘텐츠 원장
(`content/lexemes.json`)에는 나중에 배치·예문 작성을 기다리는 단어까지
합쳐 1,046개가 있다. 왜 "정확히 1,000개"가 아닌지, 지금까지 콘텐츠를
어떻게 검증·확정해 왔는지는 [`docs/product-improvement-plan.md`](docs/product-improvement-plan.md)의
"현재 상태와 문서 지도"를 보면 된다.

## 실행

Node.js 22 이상 필요.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:8080 을 엽니다.

진행도(해금·복습노트)는 브라우저에 저장됩니다.

예문 원본 정리는 [`data/aihub/README.md`](data/aihub/README.md) 를 보면 됩니다. 앱이 쓰는 단어·발음은 `src/data/units.json` 과 `public/audio/` 입니다(직접 손으로 고치지 말 것 — `content/` 원장에서 `node scripts/build-content.mjs`로 생성되는 빌드 산출물입니다. 자세한 데이터 흐름은 [`DATA.md`](DATA.md) 참고).
