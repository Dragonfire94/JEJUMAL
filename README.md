# 제주말

소리로 배우는 제주어 학습 앱. 애기해녀 → 하군 → 중군 → 상군 → 대상군, 등급당 200단어, 전체 1,000단어.

## 실행

Node.js 22 이상 필요.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:8080 을 엽니다.

진행도(해금·복습노트)는 브라우저에 저장됩니다.

예문 원본 정리는 [`data/aihub/README.md`](data/aihub/README.md) 를 보면 됩니다. 앱이 쓰는 1,000단어·발음은 `src/data/units.json` 과 `public/audio/` 입니다.
