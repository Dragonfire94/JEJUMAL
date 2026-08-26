import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { r as Slot } from "../_libs/@radix-ui/react-primitive+[...].mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { _ as createRootRoute, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as BookOpen, i as RotateCcw, n as Volume2, r as TriangleAlert, s as Check, t as X } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-1gNz9FI0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var units = /* @__PURE__ */ JSON.parse("[{\"id\":\"family\",\"title\":\"가족과 사람\",\"order\":1,\"words\":[{\"seq\":\"702\",\"jeju\":\"아방\",\"standard\":\"아버지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=702\",\"partOfSpeech\":\"noun\"},{\"seq\":\"713\",\"jeju\":\"어멍\",\"standard\":\"어머니\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=713\",\"partOfSpeech\":\"noun\"},{\"seq\":\"7568\",\"jeju\":\"하르방\",\"standard\":\"할아버지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7568\",\"partOfSpeech\":\"noun\"},{\"seq\":\"7569\",\"jeju\":\"할망\",\"standard\":\"할머니\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7569\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2695\",\"jeju\":\"오라방\",\"standard\":\"오빠\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2695\",\"partOfSpeech\":\"noun\"},{\"seq\":\"544\",\"jeju\":\"성\",\"standard\":\"형\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=544\",\"partOfSpeech\":\"noun\"},{\"seq\":\"581\",\"jeju\":\"아시\",\"standard\":\"동생\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=581\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2748\",\"jeju\":\"조캐\",\"standard\":\"조카\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2748\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6729\",\"jeju\":\"큰아방\",\"standard\":\"큰아버지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6729\",\"partOfSpeech\":\"noun\"},{\"seq\":\"372\",\"jeju\":\"각씨\",\"standard\":\"아내\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=372\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"body\",\"title\":\"몸\",\"order\":2,\"words\":[{\"seq\":\"2775\",\"jeju\":\"가심\",\"standard\":\"가슴\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2775\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3139\",\"jeju\":\"손콥\",\"standard\":\"손톱\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3139\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3138\",\"jeju\":\"발콥\",\"standard\":\"발톱\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3138\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3089\",\"jeju\":\"입바위\",\"standard\":\"입술\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3089\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2914\",\"jeju\":\"멘손\",\"standard\":\"맨손\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2914\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2913\",\"jeju\":\"멘발\",\"standard\":\"맨발\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2913\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2778\",\"jeju\":\"갈리\",\"standard\":\"갈비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2778\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2828\",\"jeju\":\"귓밥\",\"standard\":\"귀지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2828\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3001\",\"jeju\":\"세깍\",\"standard\":\"혀끝\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3001\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2917\",\"jeju\":\"모감지\",\"standard\":\"멱살\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2917\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"food\",\"title\":\"음식\",\"order\":3,\"words\":[{\"seq\":\"6775\",\"jeju\":\"옛\",\"standard\":\"엿\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6775\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3544\",\"jeju\":\"청\",\"standard\":\"꿀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3544\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6747\",\"jeju\":\"소곰\",\"standard\":\"소금\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6747\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3451\",\"jeju\":\"둠비\",\"standard\":\"두부\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3451\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4300\",\"jeju\":\"고치\",\"standard\":\"고추\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4300\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6762\",\"jeju\":\"시리떡\",\"standard\":\"시루떡\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6762\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3419\",\"jeju\":\"곤죽\",\"standard\":\"쌀죽\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3419\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3433\",\"jeju\":\"넹수\",\"standard\":\"냉수\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3433\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3525\",\"jeju\":\"조축\",\"standard\":\"조죽\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3525\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6750\",\"jeju\":\"소쥐\",\"standard\":\"소주\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6750\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"verbs\",\"title\":\"움직임 (동사 기초)\",\"order\":4,\"words\":[{\"seq\":\"6892\",\"jeju\":\"놓이다\",\"standard\":\"놓다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6892\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7144\",\"jeju\":\"페우다\",\"standard\":\"펴다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7144\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7085\",\"jeju\":\"익다\",\"standard\":\"읽다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7085\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7073\",\"jeju\":\"앚다\",\"standard\":\"앉다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7073\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7071\",\"jeju\":\"씨다\",\"standard\":\"쓰다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7071\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7061\",\"jeju\":\"싯다\",\"standard\":\"씻다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7061\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6980\",\"jeju\":\"무끄다\",\"standard\":\"묶다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6980\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6967\",\"jeju\":\"메다\",\"standard\":\"매다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6967\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6930\",\"jeju\":\"들르다\",\"standard\":\"들다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6930\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6919\",\"jeju\":\"도왜다\",\"standard\":\"돕다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6919\",\"partOfSpeech\":\"verb\"}]},{\"id\":\"adjectives\",\"title\":\"상태 (형용사 기초)\",\"order\":5,\"words\":[{\"seq\":\"7157\",\"jeju\":\"히다\",\"standard\":\"희다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7157\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7329\",\"jeju\":\"하다\",\"standard\":\"많다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7329\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7299\",\"jeju\":\"지프다\",\"standard\":\"깊다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7299\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7170\",\"jeju\":\"넙다\",\"standard\":\"넓다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7170\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7256\",\"jeju\":\"알리다\",\"standard\":\"아프다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7256\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7288\",\"jeju\":\"조랍다\",\"standard\":\"졸리다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7288\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7192\",\"jeju\":\"물르다\",\"standard\":\"무르다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7192\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7279\",\"jeju\":\"요망지다\",\"standard\":\"똑똑하다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7279\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7235\",\"jeju\":\"서느럽다\",\"standard\":\"선선하다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7235\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7296\",\"jeju\":\"지껍다\",\"standard\":\"기쁘다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7296\",\"partOfSpeech\":\"adjective\"}]},{\"id\":\"house_clothes\",\"title\":\"집과 생활\",\"order\":6,\"words\":[{\"seq\":\"3372\",\"jeju\":\"초집\",\"standard\":\"초가집\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3372\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3296\",\"jeju\":\"안거리\",\"standard\":\"안채\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3296\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3356\",\"jeju\":\"지엣장\",\"standard\":\"기왓장\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3356\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3373\",\"jeju\":\"추년\",\"standard\":\"추녀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3373\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3301\",\"jeju\":\"알녁거리\",\"standard\":\"앞채\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3301\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6783\",\"jeju\":\"우티\",\"standard\":\"웃옷\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6783\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6782\",\"jeju\":\"우투\",\"standard\":\"외투\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6782\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6780\",\"jeju\":\"옷짓\",\"standard\":\"옷깃\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6780\",\"partOfSpeech\":\"noun\"},{\"seq\":\"807\",\"jeju\":\"빈네\",\"standard\":\"비녀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=807\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6786\",\"jeju\":\"이불자리\",\"standard\":\"이불요\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6786\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"animals\",\"title\":\"동물\",\"order\":7,\"words\":[{\"seq\":\"1957\",\"jeju\":\"강생이\",\"standard\":\"강아지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1957\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2020\",\"jeju\":\"도새기\",\"standard\":\"돼지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2020\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1969\",\"jeju\":\"고냉이\",\"standard\":\"고양이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1969\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2493\",\"jeju\":\"청벌\",\"standard\":\"꿀벌\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2493\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2471\",\"jeju\":\"불한듸\",\"standard\":\"반디\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2471\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2468\",\"jeju\":\"베록\",\"standard\":\"벼룩\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2468\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2275\",\"jeju\":\"물이실\",\"standard\":\"해파리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2275\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1879\",\"jeju\":\"그레기\",\"standard\":\"기러기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1879\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1987\",\"jeju\":\"납\",\"standard\":\"나비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1987\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2452\",\"jeju\":\"베염\",\"standard\":\"뱀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2452\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"nature_plants\",\"title\":\"자연과 식물\",\"order\":8,\"words\":[{\"seq\":\"3955\",\"jeju\":\"신속\",\"standard\":\"쑥\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3955\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4188\",\"jeju\":\"강낭대죽\",\"standard\":\"옥수수\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4188\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4230\",\"jeju\":\"사당대죽\",\"standard\":\"사탕수수\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4230\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4163\",\"jeju\":\"곡석\",\"standard\":\"곡식\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4163\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4316\",\"jeju\":\"드룻마농\",\"standard\":\"달래\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4316\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4348\",\"jeju\":\"짐\",\"standard\":\"김\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4348\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4317\",\"jeju\":\"들굽\",\"standard\":\"두릅\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4317\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3958\",\"jeju\":\"베\",\"standard\":\"배\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3958\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4464\",\"jeju\":\"포두\",\"standard\":\"포도\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4464\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4465\",\"jeju\":\"피파\",\"standard\":\"비파\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4465\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"farming_sky\",\"title\":\"농사와 하늘\",\"order\":9,\"words\":[{\"seq\":\"1553\",\"jeju\":\"물밭\",\"standard\":\"논\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1553\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1583\",\"jeju\":\"조팥\",\"standard\":\"조밭\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1583\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1380\",\"jeju\":\"걸름\",\"standard\":\"거름\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1380\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1655\",\"jeju\":\"밭갊\",\"standard\":\"밭갈이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1655\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1524\",\"jeju\":\"메터\",\"standard\":\"모판\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1524\",\"partOfSpeech\":\"noun\"},{\"seq\":\"52\",\"jeju\":\"언비\",\"standard\":\"찬비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=52\",\"partOfSpeech\":\"noun\"},{\"seq\":\"42\",\"jeju\":\"새벨\",\"standard\":\"샛별\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=42\",\"partOfSpeech\":\"noun\"},{\"seq\":\"31\",\"jeju\":\"베락\",\"standard\":\"벼락\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=31\",\"partOfSpeech\":\"noun\"},{\"seq\":\"266\",\"jeju\":\"하늬\",\"standard\":\"북\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=266\",\"partOfSpeech\":\"noun\"},{\"seq\":\"258\",\"jeju\":\"앞\",\"standard\":\"남쪽\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=258\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"expressions\",\"title\":\"표현\",\"order\":10,\"words\":[{\"seq\":\"7557\",\"jeju\":\"무사\",\"standard\":\"왜\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7557\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7496\",\"jeju\":\"하영\",\"standard\":\"많이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7496\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7564\",\"jeju\":\"옵서\",\"standard\":\"오다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7564\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7554\",\"jeju\":\"기여\",\"standard\":\"그래\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7554\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"5707\",\"jeju\":\"이디\",\"standard\":\"여기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5707\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5709\",\"jeju\":\"저디\",\"standard\":\"저기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5709\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5704\",\"jeju\":\"이거\",\"standard\":\"이것\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5704\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5696\",\"jeju\":\"누게\",\"standard\":\"누구\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5696\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5718\",\"jeju\":\"싯\",\"standard\":\"셋\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5718\",\"partOfSpeech\":\"number\"},{\"seq\":\"5721\",\"jeju\":\"여답\",\"standard\":\"여덟\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5721\",\"partOfSpeech\":\"number\"}]},{\"id\":\"culture\",\"title\":\"문화\",\"order\":11,\"words\":[{\"seq\":\"6067\",\"jeju\":\"허재비\",\"standard\":\"허수아비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6067\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1857\",\"jeju\":\"코시\",\"standard\":\"고사\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1857\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6073\",\"jeju\":\"개당\",\"standard\":\"바닷가에 있는 당\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6073\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3335\",\"jeju\":\"정낭\",\"standard\":\"제주식 나무 대문\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3335\",\"partOfSpeech\":\"noun\"},{\"seq\":\"5137\",\"jeju\":\"불턱\",\"standard\":\"해녀들의 불 피우는 쉼터\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5137\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1862\",\"jeju\":\"할망당\",\"standard\":\"여신을 모신 당\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1862\",\"partOfSpeech\":\"noun\"},{\"seq\":\"662\",\"jeju\":\"새서방\",\"standard\":\"신랑\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=662\",\"partOfSpeech\":\"noun\"},{\"seq\":\"7530\",\"jeju\":\"새각시\",\"standard\":\"신부\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7530\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4066\",\"jeju\":\"촐\",\"standard\":\"꼴\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4066\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1649\",\"jeju\":\"휨\",\"standard\":\"헤엄\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1649\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"pronouns\",\"title\":\"나와 너\",\"order\":12,\"words\":[{\"seq\":\"5697\",\"jeju\":\"느\",\"standard\":\"너\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5697\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5694\",\"jeju\":\"너내\",\"standard\":\"너희\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5694\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5691\",\"jeju\":\"거\",\"standard\":\"그것\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5691\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5708\",\"jeju\":\"저거\",\"standard\":\"저것\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5708\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5701\",\"jeju\":\"무스거\",\"standard\":\"무엇\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5701\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"7528\",\"jeju\":\"무신\",\"standard\":\"무슨\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7528\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5716\",\"jeju\":\"선매\",\"standard\":\"얼마\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5716\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5693\",\"jeju\":\"그디\",\"standard\":\"거기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5693\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5703\",\"jeju\":\"요디\",\"standard\":\"요기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5703\",\"partOfSpeech\":\"pronoun\"},{\"seq\":\"5714\",\"jeju\":\"멧\",\"standard\":\"몇\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5714\",\"partOfSpeech\":\"number\"}]},{\"id\":\"talk\",\"title\":\"말 걸기\",\"order\":13,\"words\":[{\"seq\":\"7555\",\"jeju\":\"날봅서\",\"standard\":\"여보세요\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7555\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7560\",\"jeju\":\"양\",\"standard\":\"예\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7560\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7563\",\"jeju\":\"예게\",\"standard\":\"예예\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7563\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7561\",\"jeju\":\"어이\",\"standard\":\"여보게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7561\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7552\",\"jeju\":\"겔쎄\",\"standard\":\"글쎄\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7552\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7551\",\"jeju\":\"게메\",\"standard\":\"그러게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7551\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7550\",\"jeju\":\"게\",\"standard\":\"그래\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7550\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7553\",\"jeju\":\"그거무사\",\"standard\":\"아뿔싸\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7553\",\"partOfSpeech\":\"interjection\"},{\"seq\":\"7466\",\"jeju\":\"영판\",\"standard\":\"아주\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7466\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"295\",\"jeju\":\"닐\",\"standard\":\"내일\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=295\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"verbs2\",\"title\":\"움직임 2\",\"order\":14,\"words\":[{\"seq\":\"5916\",\"jeju\":\"귿다\",\"standard\":\"걷다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5916\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6928\",\"jeju\":\"드르쓰다\",\"standard\":\"마시다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6928\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7026\",\"jeju\":\"불르다\",\"standard\":\"부르다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7026\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7107\",\"jeju\":\"지드리다\",\"standard\":\"기다리다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7107\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6977\",\"jeju\":\"몰르다\",\"standard\":\"모르다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6977\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7087\",\"jeju\":\"욜다\",\"standard\":\"열다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7087\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6969\",\"jeju\":\"멘들다\",\"standard\":\"만들다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6969\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7052\",\"jeju\":\"쌉다\",\"standard\":\"싸우다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7052\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7130\",\"jeju\":\"케다\",\"standard\":\"캐다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7130\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6983\",\"jeju\":\"묻치다\",\"standard\":\"묻다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6983\",\"partOfSpeech\":\"verb\"}]},{\"id\":\"adjectives2\",\"title\":\"상태 2\",\"order\":15,\"words\":[{\"seq\":\"7289\",\"jeju\":\"족다\",\"standard\":\"작다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7289\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7187\",\"jeju\":\"멥다\",\"standard\":\"맵다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7187\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7263\",\"jeju\":\"얼다\",\"standard\":\"춥다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7263\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7165\",\"jeju\":\"궂다\",\"standard\":\"나쁘다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7165\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7338\",\"jeju\":\"훍다\",\"standard\":\"굵다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7338\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7297\",\"jeju\":\"지접다\",\"standard\":\"뜨겁다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7297\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7253\",\"jeju\":\"아깝다\",\"standard\":\"귀엽다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7253\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7248\",\"jeju\":\"실프다\",\"standard\":\"싫다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7248\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7174\",\"jeju\":\"달르다\",\"standard\":\"다르다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7174\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7175\",\"jeju\":\"두덥다\",\"standard\":\"두껍다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7175\",\"partOfSpeech\":\"adjective\"}]},{\"id\":\"sea\",\"title\":\"바다\",\"order\":16,\"words\":[{\"seq\":\"148\",\"jeju\":\"바당\",\"standard\":\"바다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=148\",\"partOfSpeech\":\"noun\"},{\"seq\":\"5009\",\"jeju\":\"물질\",\"standard\":\"해녀 잠수\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5009\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2254\",\"jeju\":\"구제기\",\"standard\":\"소라\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2254\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2253\",\"jeju\":\"구살\",\"standard\":\"성게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2253\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2347\",\"jeju\":\"겡이\",\"standard\":\"게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2347\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2393\",\"jeju\":\"새위\",\"standard\":\"새우\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2393\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2300\",\"jeju\":\"오징에\",\"standard\":\"오징어\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2300\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2405\",\"jeju\":\"자리\",\"standard\":\"자돔\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2405\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2394\",\"jeju\":\"셍성\",\"standard\":\"옥돔\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2394\",\"partOfSpeech\":\"noun\"},{\"seq\":\"81\",\"jeju\":\"개맡\",\"standard\":\"포구\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=81\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"weather\",\"title\":\"날씨\",\"order\":17,\"words\":[{\"seq\":\"71\",\"jeju\":\"헤\",\"standard\":\"해\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=71\",\"partOfSpeech\":\"noun\"},{\"seq\":\"32\",\"jeju\":\"벨\",\"standard\":\"별\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=32\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6\",\"jeju\":\"노대\",\"standard\":\"태풍\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6\",\"partOfSpeech\":\"noun\"},{\"seq\":\"61\",\"jeju\":\"줌벙이\",\"standard\":\"가랑비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=61\",\"partOfSpeech\":\"noun\"},{\"seq\":\"48\",\"jeju\":\"쐬내기\",\"standard\":\"소나기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=48\",\"partOfSpeech\":\"noun\"},{\"seq\":\"53\",\"jeju\":\"으남\",\"standard\":\"안개\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=53\",\"partOfSpeech\":\"noun\"},{\"seq\":\"41\",\"jeju\":\"상고지\",\"standard\":\"무지개\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=41\",\"partOfSpeech\":\"noun\"},{\"seq\":\"64\",\"jeju\":\"펀개\",\"standard\":\"번개\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=64\",\"partOfSpeech\":\"noun\"},{\"seq\":\"36\",\"jeju\":\"빗주제\",\"standard\":\"갑작비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=36\",\"partOfSpeech\":\"noun\"},{\"seq\":\"19\",\"jeju\":\"동곳\",\"standard\":\"고드름\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=19\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"people2\",\"title\":\"사람과 가족 2\",\"order\":18,\"words\":[{\"seq\":\"537\",\"jeju\":\"사름\",\"standard\":\"사람\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=537\",\"partOfSpeech\":\"noun\"},{\"seq\":\"502\",\"jeju\":\"메누리\",\"standard\":\"며느리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=502\",\"partOfSpeech\":\"noun\"},{\"seq\":\"693\",\"jeju\":\"씨어멍\",\"standard\":\"시어머니\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=693\",\"partOfSpeech\":\"noun\"},{\"seq\":\"692\",\"jeju\":\"씨아방\",\"standard\":\"시아버지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=692\",\"partOfSpeech\":\"noun\"},{\"seq\":\"681\",\"jeju\":\"손지\",\"standard\":\"손자\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=681\",\"partOfSpeech\":\"noun\"},{\"seq\":\"646\",\"jeju\":\"부미\",\"standard\":\"부모\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=646\",\"partOfSpeech\":\"noun\"},{\"seq\":\"664\",\"jeju\":\"성제\",\"standard\":\"형제\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=664\",\"partOfSpeech\":\"noun\"},{\"seq\":\"424\",\"jeju\":\"나그네\",\"standard\":\"손님\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=424\",\"partOfSpeech\":\"noun\"},{\"seq\":\"725\",\"jeju\":\"예식\",\"standard\":\"딸\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=725\",\"partOfSpeech\":\"noun\"},{\"seq\":\"628\",\"jeju\":\"물애기\",\"standard\":\"갓난아이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=628\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"food2\",\"title\":\"밥상 2\",\"order\":19,\"words\":[{\"seq\":\"3423\",\"jeju\":\"괴기\",\"standard\":\"고기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3423\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3536\",\"jeju\":\"짐끼\",\"standard\":\"김치\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3536\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4345\",\"jeju\":\"지슬\",\"standard\":\"감자\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4345\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3473\",\"jeju\":\"물장\",\"standard\":\"간장\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3473\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4607\",\"jeju\":\"지름\",\"standard\":\"기름\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4607\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6761\",\"jeju\":\"쉰다리\",\"standard\":\"단술\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6761\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3449\",\"jeju\":\"된술\",\"standard\":\"막걸리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3449\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6763\",\"jeju\":\"식게\",\"standard\":\"식혜\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6763\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6756\",\"jeju\":\"수에\",\"standard\":\"순대\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6756\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3425\",\"jeju\":\"군것\",\"standard\":\"간식\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3425\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"land\",\"title\":\"집과 땅\",\"order\":20,\"words\":[{\"seq\":\"3310\",\"jeju\":\"올래\",\"standard\":\"집 가는 길\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3310\",\"partOfSpeech\":\"noun\"},{\"seq\":\"215\",\"jeju\":\"질\",\"standard\":\"길\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=215\",\"partOfSpeech\":\"noun\"},{\"seq\":\"958\",\"jeju\":\"구덕\",\"standard\":\"바구니\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=958\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4004\",\"jeju\":\"자왈\",\"standard\":\"덤불 숲\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4004\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2560\",\"jeju\":\"남\",\"standard\":\"나무\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2560\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4089\",\"jeju\":\"쿨\",\"standard\":\"풀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4089\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4370\",\"jeju\":\"고장\",\"standard\":\"꽃\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4370\",\"partOfSpeech\":\"noun\"},{\"seq\":\"108\",\"jeju\":\"따\",\"standard\":\"땅\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=108\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4484\",\"jeju\":\"모살\",\"standard\":\"모래\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4484\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6692\",\"jeju\":\"돌하르방\",\"standard\":\"돌하르방\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6692\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"verbs3\",\"title\":\"움직임 3\",\"order\":21,\"words\":[{\"seq\":\"5827\",\"jeju\":\"께다\",\"standard\":\"깨다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5827\",\"partOfSpeech\":\"verb\"},{\"seq\":\"5830\",\"jeju\":\"께우다\",\"standard\":\"깨우다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5830\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6881\",\"jeju\":\"날르다\",\"standard\":\"나르다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6881\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6879\",\"jeju\":\"나무래다\",\"standard\":\"나무라다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6879\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6886\",\"jeju\":\"냉기다\",\"standard\":\"남기다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6886\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6884\",\"jeju\":\"내앋다\",\"standard\":\"내놓다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6884\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6883\",\"jeju\":\"내불다\",\"standard\":\"내버리다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6883\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6891\",\"jeju\":\"넹기다\",\"standard\":\"넘기다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6891\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7079\",\"jeju\":\"어우러지다\",\"standard\":\"넘어지다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7079\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6894\",\"jeju\":\"늘루다\",\"standard\":\"늘리다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6894\",\"partOfSpeech\":\"verb\"}]},{\"id\":\"verbs4\",\"title\":\"움직임 4\",\"order\":22,\"words\":[{\"seq\":\"6960\",\"jeju\":\"맽기다\",\"standard\":\"맡기다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6960\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6961\",\"jeju\":\"머물르다\",\"standard\":\"머물다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6961\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6962\",\"jeju\":\"머추다\",\"standard\":\"멈추다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6962\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6966\",\"jeju\":\"메꾸다\",\"standard\":\"메우다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6966\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6975\",\"jeju\":\"몯다\",\"standard\":\"모이다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6975\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6968\",\"jeju\":\"메우다\",\"standard\":\"모으다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6968\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6923\",\"jeju\":\"되쓰다\",\"standard\":\"뒤집다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6923\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6926\",\"jeju\":\"둥글다\",\"standard\":\"뒹굴다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6926\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7134\",\"jeju\":\"털어지다\",\"standard\":\"떨어지다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7134\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7014\",\"jeju\":\"벳기다\",\"standard\":\"벗기다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7014\",\"partOfSpeech\":\"verb\"}]},{\"id\":\"verbs5\",\"title\":\"움직임 5\",\"order\":23,\"words\":[{\"seq\":\"7011\",\"jeju\":\"베우다\",\"standard\":\"보이다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7011\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7022\",\"jeju\":\"부찌다\",\"standard\":\"붙이다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7022\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7029\",\"jeju\":\"비끼다\",\"standard\":\"비키다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7029\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6987\",\"jeju\":\"밀리다\",\"standard\":\"밀다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6987\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7001\",\"jeju\":\"발르다\",\"standard\":\"바르다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7001\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7006\",\"jeju\":\"버이다\",\"standard\":\"베다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7006\",\"partOfSpeech\":\"verb\"},{\"seq\":\"6918\",\"jeju\":\"데우치다\",\"standard\":\"데치다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6918\",\"partOfSpeech\":\"verb\"},{\"seq\":\"5845\",\"jeju\":\"고찌다\",\"standard\":\"고치다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5845\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7111\",\"jeju\":\"질들이다\",\"standard\":\"길들이다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7111\",\"partOfSpeech\":\"verb\"},{\"seq\":\"7139\",\"jeju\":\"파장치다\",\"standard\":\"끝내다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7139\",\"partOfSpeech\":\"verb\"}]},{\"id\":\"adj3\",\"title\":\"상태 3\",\"order\":24,\"words\":[{\"seq\":\"7158\",\"jeju\":\"가벱다\",\"standard\":\"가볍다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7158\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7267\",\"jeju\":\"여데다\",\"standard\":\"같다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7267\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7209\",\"jeju\":\"베다\",\"standard\":\"무겁다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7209\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7188\",\"jeju\":\"모지래다\",\"standard\":\"모자라다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7188\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7214\",\"jeju\":\"보드랍다\",\"standard\":\"부드럽다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7214\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7179\",\"jeju\":\"두물다\",\"standard\":\"드물다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7179\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7258\",\"jeju\":\"야리다\",\"standard\":\"여리다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7258\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7239\",\"jeju\":\"싸무랍다\",\"standard\":\"사납다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7239\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7242\",\"jeju\":\"쎄다\",\"standard\":\"세다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7242\",\"partOfSpeech\":\"adjective\"},{\"seq\":\"7215\",\"jeju\":\"보미다\",\"standard\":\"낡다\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7215\",\"partOfSpeech\":\"adjective\"}]},{\"id\":\"adv1\",\"title\":\"어찌 1\",\"order\":25,\"words\":[{\"seq\":\"7353\",\"jeju\":\"깜째기\",\"standard\":\"갑자기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7353\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7347\",\"jeju\":\"거꿀로\",\"standard\":\"거꾸로\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7347\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7348\",\"jeju\":\"거쓴\",\"standard\":\"얼른\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7348\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7358\",\"jeju\":\"곧작\",\"standard\":\"곧장\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7358\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7355\",\"jeju\":\"게민\",\"standard\":\"그러면\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7355\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7351\",\"jeju\":\"게난\",\"standard\":\"그러니까\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7351\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7361\",\"jeju\":\"그냥\",\"standard\":\"그대로\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7361\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7357\",\"jeju\":\"경\",\"standard\":\"그렇게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7357\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7393\",\"jeju\":\"똑\",\"standard\":\"꼭\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7393\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7354\",\"jeju\":\"깨\",\"standard\":\"꽤\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7354\",\"partOfSpeech\":\"adverb\"}]},{\"id\":\"adv2\",\"title\":\"어찌 2\",\"order\":26,\"words\":[{\"seq\":\"7384\",\"jeju\":\"늦이\",\"standard\":\"늦게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7384\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7388\",\"jeju\":\"대걸롱\",\"standard\":\"대강\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7388\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7391\",\"jeju\":\"데번에\",\"standard\":\"한 번에\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7391\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7417\",\"jeju\":\"미릇\",\"standard\":\"미리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7417\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7469\",\"jeju\":\"원체\",\"standard\":\"원래\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7469\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7444\",\"jeju\":\"쉬이\",\"standard\":\"쉽게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7444\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7445\",\"jeju\":\"슬짝\",\"standard\":\"슬그머니\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7445\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7456\",\"jeju\":\"어떵\",\"standard\":\"어떻게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7456\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7459\",\"jeju\":\"어서라\",\"standard\":\"어서\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7459\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7490\",\"jeju\":\"천성\",\"standard\":\"언제나\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7490\",\"partOfSpeech\":\"adverb\"}]},{\"id\":\"body2\",\"title\":\"몸 2\",\"order\":27,\"words\":[{\"seq\":\"2842\",\"jeju\":\"눈방울\",\"standard\":\"눈동자\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2842\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2839\",\"jeju\":\"눈두께\",\"standard\":\"눈꺼풀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2839\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2836\",\"jeju\":\"눈깍\",\"standard\":\"눈초리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2836\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3109\",\"jeju\":\"종애\",\"standard\":\"종아리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3109\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2829\",\"jeju\":\"귓자락\",\"standard\":\"귓방울\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2829\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3003\",\"jeju\":\"세덩치\",\"standard\":\"혀뿌리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3003\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3171\",\"jeju\":\"허벅다리\",\"standard\":\"넓적다리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3171\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3088\",\"jeju\":\"입개미\",\"standard\":\"입아귀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3088\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2885\",\"jeju\":\"뒷고개\",\"standard\":\"뒷덜미\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2885\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3011\",\"jeju\":\"손등어리\",\"standard\":\"손등\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3011\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"people3\",\"title\":\"사람과 가족 3\",\"order\":28,\"words\":[{\"seq\":\"432\",\"jeju\":\"냄편\",\"standard\":\"남편\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=432\",\"partOfSpeech\":\"noun\"},{\"seq\":\"448\",\"jeju\":\"늑신이\",\"standard\":\"늙은이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=448\",\"partOfSpeech\":\"noun\"},{\"seq\":\"690\",\"jeju\":\"씨누이\",\"standard\":\"시누이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=690\",\"partOfSpeech\":\"noun\"},{\"seq\":\"636\",\"jeju\":\"방세임\",\"standard\":\"아가씨\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=636\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2710\",\"jeju\":\"으른\",\"standard\":\"어른\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2710\",\"partOfSpeech\":\"noun\"},{\"seq\":\"718\",\"jeju\":\"얼애\",\"standard\":\"어린애\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=718\",\"partOfSpeech\":\"noun\"},{\"seq\":\"653\",\"jeju\":\"비바리\",\"standard\":\"처녀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=653\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2770\",\"jeju\":\"쥐인\",\"standard\":\"주인\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2770\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6706\",\"jeju\":\"처아주망\",\"standard\":\"처제\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6706\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6705\",\"jeju\":\"처아주마님\",\"standard\":\"처형\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6705\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"living\",\"title\":\"옷과 살림\",\"order\":29,\"words\":[{\"seq\":\"3312\",\"jeju\":\"와채\",\"standard\":\"기와집\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3312\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3242\",\"jeju\":\"벌름\",\"standard\":\"방앗간\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3242\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3274\",\"jeju\":\"상자리\",\"standard\":\"정자\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3274\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3333\",\"jeju\":\"접담\",\"standard\":\"절\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3333\",\"partOfSpeech\":\"noun\"},{\"seq\":\"808\",\"jeju\":\"사포\",\"standard\":\"모자\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=808\",\"partOfSpeech\":\"noun\"},{\"seq\":\"838\",\"jeju\":\"치메\",\"standard\":\"치마\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=838\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1421\",\"jeju\":\"주멩기\",\"standard\":\"주머니\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1421\",\"partOfSpeech\":\"noun\"},{\"seq\":\"776\",\"jeju\":\"단취\",\"standard\":\"단추\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=776\",\"partOfSpeech\":\"noun\"},{\"seq\":\"753\",\"jeju\":\"게화\",\"standard\":\"호주머니\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=753\",\"partOfSpeech\":\"noun\"},{\"seq\":\"757\",\"jeju\":\"곤옷\",\"standard\":\"고운 옷\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=757\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"kitchen\",\"title\":\"부엌\",\"order\":30,\"words\":[{\"seq\":\"3640\",\"jeju\":\"바농\",\"standard\":\"바늘\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3640\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1265\",\"jeju\":\"씰\",\"standard\":\"실\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1265\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1309\",\"jeju\":\"주전지\",\"standard\":\"주전자\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1309\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1232\",\"jeju\":\"숟구락\",\"standard\":\"숟가락\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1232\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1333\",\"jeju\":\"추니\",\"standard\":\"항아리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1333\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1222\",\"jeju\":\"섹경\",\"standard\":\"거울\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1222\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3284\",\"jeju\":\"솥덕\",\"standard\":\"부뚜막\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3284\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6770\",\"jeju\":\"안쥐\",\"standard\":\"안주\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6770\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6774\",\"jeju\":\"언물\",\"standard\":\"찬물\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6774\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6749\",\"jeju\":\"소곰쿡\",\"standard\":\"소금국\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6749\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"weather2\",\"title\":\"날씨 2\",\"order\":31,\"words\":[{\"seq\":\"70\",\"jeju\":\"험벅눈\",\"standard\":\"함박눈\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=70\",\"partOfSpeech\":\"noun\"},{\"seq\":\"72\",\"jeju\":\"헤돋이\",\"standard\":\"해돋이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=72\",\"partOfSpeech\":\"noun\"},{\"seq\":\"35\",\"jeju\":\"빗살\",\"standard\":\"빗방울\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=35\",\"partOfSpeech\":\"noun\"},{\"seq\":\"28\",\"jeju\":\"무눈\",\"standard\":\"눈비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=28\",\"partOfSpeech\":\"noun\"},{\"seq\":\"62\",\"jeju\":\"진벵이\",\"standard\":\"진눈깨비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=62\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2\",\"jeju\":\"강쳉이\",\"standard\":\"갑작 폭풍\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2\",\"partOfSpeech\":\"noun\"},{\"seq\":\"261\",\"jeju\":\"우녁\",\"standard\":\"위쪽\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=261\",\"partOfSpeech\":\"noun\"},{\"seq\":\"257\",\"jeju\":\"알\",\"standard\":\"아래\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=257\",\"partOfSpeech\":\"noun\"},{\"seq\":\"29\",\"jeju\":\"미릿내\",\"standard\":\"은하수\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=29\",\"partOfSpeech\":\"noun\"},{\"seq\":\"73\",\"jeju\":\"헷갓\",\"standard\":\"햇무리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=73\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"animals2\",\"title\":\"동물 2\",\"order\":32,\"words\":[{\"seq\":\"2126\",\"jeju\":\"산톳\",\"standard\":\"멧돼지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2126\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2154\",\"jeju\":\"식\",\"standard\":\"삵\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2154\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2202\",\"jeju\":\"일희\",\"standard\":\"이리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2202\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2149\",\"jeju\":\"수코냉이\",\"standard\":\"수고양이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2149\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2165\",\"jeju\":\"암톳\",\"standard\":\"암퇘지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2165\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2150\",\"jeju\":\"수톳\",\"standard\":\"수퇘지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2150\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2091\",\"jeju\":\"벡돗\",\"standard\":\"흰돼지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2091\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2167\",\"jeju\":\"어럭개\",\"standard\":\"얼룩개\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2167\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2016\",\"jeju\":\"땅강생이\",\"standard\":\"발바리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2016\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1752\",\"jeju\":\"가냐귀\",\"standard\":\"까마귀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1752\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"plants2\",\"title\":\"식물 2\",\"order\":33,\"words\":[{\"seq\":\"6052\",\"jeju\":\"게가비\",\"standard\":\"개나리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6052\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4447\",\"jeju\":\"제지\",\"standard\":\"겨자\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4447\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6108\",\"jeju\":\"고베기\",\"standard\":\"고비\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6108\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6025\",\"jeju\":\"돔박낭\",\"standard\":\"동백나무\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6025\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2679\",\"jeju\":\"넙곽\",\"standard\":\"다시마\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2679\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2561\",\"jeju\":\"남초\",\"standard\":\"담배\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2561\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4184\",\"jeju\":\"땅콩\",\"standard\":\"땅콩\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4184\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4266\",\"jeju\":\"지장\",\"standard\":\"기장\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4266\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2672\",\"jeju\":\"낭쎂\",\"standard\":\"나뭇잎\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2672\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4152\",\"jeju\":\"강낭콩\",\"standard\":\"강낭콩\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4152\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"farm2\",\"title\":\"농사 2\",\"order\":34,\"words\":[{\"seq\":\"1529\",\"jeju\":\"논갊\",\"standard\":\"논갈이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1529\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1551\",\"jeju\":\"묏자리\",\"standard\":\"못자리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1551\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1561\",\"jeju\":\"벳\",\"standard\":\"볏\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1561\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1694\",\"jeju\":\"질메\",\"standard\":\"길마\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1694\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1488\",\"jeju\":\"갊\",\"standard\":\"갈이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1488\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1385\",\"jeju\":\"곰배\",\"standard\":\"흙방망이\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1385\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1697\",\"jeju\":\"촐눌\",\"standard\":\"꼴 더미\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1697\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1693\",\"jeju\":\"찍단\",\"standard\":\"짚단\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1693\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1388\",\"jeju\":\"그르팥\",\"standard\":\"가을 밭\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1388\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1516\",\"jeju\":\"드르팥\",\"standard\":\"들판 밭\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1516\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"time\",\"title\":\"때와 수\",\"order\":35,\"words\":[{\"seq\":\"327\",\"jeju\":\"아적\",\"standard\":\"아침\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=327\",\"partOfSpeech\":\"noun\"},{\"seq\":\"350\",\"jeju\":\"저냑\",\"standard\":\"저녁\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=350\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4837\",\"jeju\":\"내중\",\"standard\":\"나중\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4837\",\"partOfSpeech\":\"noun\"},{\"seq\":\"5715\",\"jeju\":\"벡\",\"standard\":\"백\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5715\",\"partOfSpeech\":\"number\"},{\"seq\":\"5717\",\"jeju\":\"쑤물\",\"standard\":\"스물\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5717\",\"partOfSpeech\":\"number\"},{\"seq\":\"5722\",\"jeju\":\"여쉰\",\"standard\":\"예순\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5722\",\"partOfSpeech\":\"number\"},{\"seq\":\"7471\",\"jeju\":\"이디저디\",\"standard\":\"여기저기\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7471\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"235\",\"jeju\":\"가온대\",\"standard\":\"가운데\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=235\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4536\",\"jeju\":\"깝\",\"standard\":\"값\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4536\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1641\",\"jeju\":\"척\",\"standard\":\"책\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1641\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"talk2\",\"title\":\"말 걸기 2\",\"order\":36,\"words\":[{\"seq\":\"7462\",\"jeju\":\"역부로\",\"standard\":\"일부러\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7462\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7477\",\"jeju\":\"제나\",\"standard\":\"제발\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7477\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7482\",\"jeju\":\"진직\",\"standard\":\"진작\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7482\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7463\",\"jeju\":\"영\",\"standard\":\"이렇게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7463\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7362\",\"jeju\":\"그냥저냥\",\"standard\":\"그럭저럭\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7362\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7364\",\"jeju\":\"그마니\",\"standard\":\"그만큼\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7364\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7472\",\"jeju\":\"이레저레\",\"standard\":\"이리저리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7472\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7480\",\"jeju\":\"졸바로\",\"standard\":\"올바르게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7480\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7432\",\"jeju\":\"부끄러이\",\"standard\":\"부끄럽게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7432\",\"partOfSpeech\":\"adverb\"},{\"seq\":\"7383\",\"jeju\":\"느런이\",\"standard\":\"나란히\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=7383\",\"partOfSpeech\":\"adverb\"}]},{\"id\":\"objects\",\"title\":\"물건\",\"order\":37,\"words\":[{\"seq\":\"299\",\"jeju\":\"돗\",\"standard\":\"돌\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=299\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4624\",\"jeju\":\"짓\",\"standard\":\"집\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4624\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1914\",\"jeju\":\"생이\",\"standard\":\"새\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1914\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1465\",\"jeju\":\"펭\",\"standard\":\"병\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1465\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1361\",\"jeju\":\"호미\",\"standard\":\"낫\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1361\",\"partOfSpeech\":\"noun\"},{\"seq\":\"926\",\"jeju\":\"갈퀴\",\"standard\":\"갈고리\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=926\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1005\",\"jeju\":\"남푸등\",\"standard\":\"등잔\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1005\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3332\",\"jeju\":\"절간\",\"standard\":\"가게\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3332\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1298\",\"jeju\":\"제\",\"standard\":\"젓가락\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1298\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2718\",\"jeju\":\"이사\",\"standard\":\"의사\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2718\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"plants3\",\"title\":\"식물 3\",\"order\":38,\"words\":[{\"seq\":\"2648\",\"jeju\":\"굴낭\",\"standard\":\"굴피나무\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2648\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6126\",\"jeju\":\"꽝낭\",\"standard\":\"꽝꽝나무\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6126\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6007\",\"jeju\":\"녹낭\",\"standard\":\"녹나무\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6007\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4021\",\"jeju\":\"제피\",\"standard\":\"계피\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4021\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2568\",\"jeju\":\"낭절\",\"standard\":\"나뭇결\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2568\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6121\",\"jeju\":\"솔낭\",\"standard\":\"곰솔\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6121\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2552\",\"jeju\":\"그르\",\"standard\":\"그루\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2552\",\"partOfSpeech\":\"noun\"},{\"seq\":\"6114\",\"jeju\":\"고소\",\"standard\":\"고삼\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=6114\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3777\",\"jeju\":\"못꼿\",\"standard\":\"꿀풀\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3777\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4098\",\"jeju\":\"토란\",\"standard\":\"도라지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4098\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"animals3\",\"title\":\"동물 3\",\"order\":39,\"words\":[{\"seq\":\"2056\",\"jeju\":\"물쇠\",\"standard\":\"물소\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2056\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2022\",\"jeju\":\"검은돗\",\"standard\":\"검은 돼지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2022\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2168\",\"jeju\":\"어럭돗\",\"standard\":\"얼룩돼지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2168\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2140\",\"jeju\":\"검은쇠\",\"standard\":\"검은 소\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2140\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2295\",\"jeju\":\"술래미\",\"standard\":\"가자미\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2295\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2416\",\"jeju\":\"흑돔\",\"standard\":\"검은 도미\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2416\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2268\",\"jeju\":\"메홍이\",\"standard\":\"주리고둥\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2268\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2474\",\"jeju\":\"서미역\",\"standard\":\"진디\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2474\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2582\",\"jeju\":\"수펄\",\"standard\":\"숫벌\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2582\",\"partOfSpeech\":\"noun\"},{\"seq\":\"2025\",\"jeju\":\"슥돗\",\"standard\":\"섞인 돼지\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=2025\",\"partOfSpeech\":\"noun\"}]},{\"id\":\"daily\",\"title\":\"일상\",\"order\":40,\"words\":[{\"seq\":\"5100\",\"jeju\":\"부끌래기\",\"standard\":\"거품\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5100\",\"partOfSpeech\":\"noun\"},{\"seq\":\"877\",\"jeju\":\"뱅고리\",\"standard\":\"가락\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=877\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4546\",\"jeju\":\"거레\",\"standard\":\"거래\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4546\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4553\",\"jeju\":\"거짓거\",\"standard\":\"가짜\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4553\",\"partOfSpeech\":\"noun\"},{\"seq\":\"5675\",\"jeju\":\"훈적\",\"standard\":\"거짓말\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5675\",\"partOfSpeech\":\"noun\"},{\"seq\":\"4531\",\"jeju\":\"간세\",\"standard\":\"게으름\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=4531\",\"partOfSpeech\":\"noun\"},{\"seq\":\"5188\",\"jeju\":\"서베\",\"standard\":\"세배\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=5188\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3478\",\"jeju\":\"밥방울\",\"standard\":\"밥알\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3478\",\"partOfSpeech\":\"noun\"},{\"seq\":\"1285\",\"jeju\":\"우굼\",\"standard\":\"밥주걱\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=1285\",\"partOfSpeech\":\"noun\"},{\"seq\":\"3707\",\"jeju\":\"수제\",\"standard\":\"수저\",\"soundUrl\":\"https://www.jeju.go.kr/api/culture/dialect?dialect=3707\",\"partOfSpeech\":\"noun\"}]}]");
var CHAPTERS = [
	{
		id: "basics",
		title: "기초",
		from: 1,
		to: 11
	},
	{
		id: "expand",
		title: "말과 바다",
		from: 12,
		to: 20
	},
	{
		id: "motion",
		title: "움직임과 상태",
		from: 21,
		to: 26
	},
	{
		id: "life",
		title: "몸과 살림",
		from: 27,
		to: 31
	},
	{
		id: "world",
		title: "자연과 일상",
		from: 32,
		to: 40
	}
];
var byId = new Map(units.map((unit) => [unit.id, unit]));
var wordIndex = /* @__PURE__ */ new Map();
for (const unit of units) for (const word of unit.words) wordIndex.set(word.seq, {
	word,
	unit
});
var TOTAL_UNITS = units.length;
var TOTAL_WORDS = wordIndex.size;
function getUnit(id) {
	return byId.get(id);
}
function getWord(seq) {
	return wordIndex.get(seq);
}
function nextUnit(id) {
	const current = byId.get(id);
	if (!current) return void 0;
	return units.find((unit) => unit.order === current.order + 1);
}
function formatUnitNumber(order) {
	return String(order).padStart(2, "0");
}
function unitsInChapter(chapter) {
	return units.filter((unit) => unit.order >= chapter.from && unit.order <= chapter.to);
}
var useProgress = create()(persist((set, get) => ({
	hydrated: false,
	completedUnitIds: [],
	lastPlayedUnitId: null,
	wrongBySeq: {},
	markHydrated: () => set({ hydrated: true }),
	isComplete: (unitId) => get().completedUnitIds.includes(unitId),
	isUnlocked: (unitId) => {
		const unit = units.find((item) => item.id === unitId);
		if (!unit) return false;
		if (unit.order <= 1) return true;
		const previous = units.find((item) => item.order === unit.order - 1);
		return previous ? get().completedUnitIds.includes(previous.id) : false;
	},
	completeUnit: (unitId) => set((state) => ({
		lastPlayedUnitId: unitId,
		completedUnitIds: state.completedUnitIds.includes(unitId) ? state.completedUnitIds : [...state.completedUnitIds, unitId]
	})),
	recordMiss: (word, unitId) => set((state) => {
		const current = state.wrongBySeq[word.seq];
		return {
			lastPlayedUnitId: unitId,
			wrongBySeq: {
				...state.wrongBySeq,
				[word.seq]: {
					seq: word.seq,
					unitId,
					jeju: word.jeju,
					standard: word.standard,
					soundUrl: word.soundUrl,
					timesMissed: (current?.timesMissed ?? 0) + 1,
					addedAt: Date.now()
				}
			}
		};
	}),
	recordHit: (seq) => set((state) => {
		if (!state.wrongBySeq[seq]) return state;
		const next = { ...state.wrongBySeq };
		delete next[seq];
		return { wrongBySeq: next };
	}),
	dismissWrong: (seq) => set((state) => {
		const next = { ...state.wrongBySeq };
		delete next[seq];
		return { wrongBySeq: next };
	}),
	wrongCards: () => Object.values(get().wrongBySeq).sort((a, b) => b.addedAt - a.addedAt),
	wrongCount: () => Object.keys(get().wrongBySeq).length,
	continueUnitId: () => {
		const { lastPlayedUnitId, completedUnitIds } = get();
		if (lastPlayedUnitId && !completedUnitIds.includes(lastPlayedUnitId)) return lastPlayedUnitId;
		return units.find((unit) => !completedUnitIds.includes(unit.id))?.id ?? units[0].id;
	}
}), {
	name: "jeju-mal:v1",
	skipHydration: true,
	partialize: (state) => ({
		completedUnitIds: state.completedUnitIds,
		lastPlayedUnitId: state.lastPlayedUnitId,
		wrongBySeq: state.wrongBySeq
	})
}));
function hydrateProgress() {
	const result = useProgress.persist.rehydrate();
	Promise.resolve(result).finally(() => {
		useProgress.getState().markHydrated();
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[transform,opacity,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
			outline: "border border-border bg-card text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			success: "bg-success text-success-foreground hover:opacity-90",
			danger: "bg-danger text-danger-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full bg-primary transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
		style: { width: `${value ?? 0}%` }
	})
}));
Progress.displayName = Root.displayName;
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-BemPB9vY.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const hydrated = useProgress((state) => state.hydrated);
	const wrongCount = useProgress((state) => Object.keys(state.wrongBySeq).length);
	(0, import_react.useEffect)(() => {
		hydrateProgress();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-h-dvh max-w-lg flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]",
				children
			}), hydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-lg grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
						to: "/",
						active: pathname === "/",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }),
						label: "배우기"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
						to: "/review",
						active: pathname.startsWith("/review"),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }),
						label: "오답",
						count: wrongCount
					})]
				})
			}) : null]
		})
	});
}
function TabLink({ to, active, icon, label, count }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("relative flex h-14 items-center justify-center gap-2 text-sm font-medium transition-colors duration-[var(--motion-quick)]", active ? "text-foreground" : "text-muted-foreground"),
		children: [
			icon,
			label,
			count ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-5 rounded-full bg-primary px-1.5 text-center text-[11px] font-semibold tabular-nums text-primary-foreground",
				children: count
			}) : null
		]
	});
}
var styles_default = "/assets/styles-Bc_UOK_z.css";
var APP_NAME = "제주말";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "소리로 배우는 제주어. 400단어, 오답 카드로 복습."
			},
			{
				name: "theme-color",
				content: "#f4efe6"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ko",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$1 = () => import("./routes-CgL69J7I.mjs");
var Route$2 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var current = null;
function stopAudio() {
	if (!current) return;
	current.pause();
	current.src = "";
	current = null;
}
function playAudio(src) {
	stopAudio();
	const audio = new Audio(src);
	current = audio;
	audio.preload = "auto";
	return new Promise((resolve, reject) => {
		const onEnded = () => {
			cleanup();
			resolve();
		};
		const onError = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("audio failed"));
		};
		const cleanup = () => {
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("error", onError);
			if (current === audio) current = null;
		};
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("error", onError);
		audio.play().catch((error) => {
			cleanup();
			reject(error);
		});
	});
}
function Flashcard({ card, remaining, total, onKnow, onAgain }) {
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const unitTitle = getUnit(card.unitId)?.title;
	(0, import_react.useEffect)(() => {
		setFlipped(false);
		playAudio(card.soundUrl).catch(() => void 0);
		return () => stopAudio();
	}, [card.seq, card.soundUrl]);
	function flip() {
		setFlipped((value) => !value);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium tabular-nums text-muted-foreground",
					children: [
						"남은 카드 ",
						remaining,
						" / ",
						total
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						unitTitle ? `${unitTitle} · ` : "",
						card.timesMissed,
						"번 틀림"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: flip,
				className: "group relative h-64 w-full rounded-2xl border border-border bg-card text-left [perspective:1200px]",
				"aria-label": flipped ? "앞면 보기" : "뒷면 보기",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("relative h-full w-full transition-transform duration-[var(--motion-slow)] ease-[var(--ease-out)] [transform-style:preserve-3d]", flipped && "[transform:rotateY(180deg)]", "motion-reduce:transition-none"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl px-6 [backface-visibility:hidden]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "제주말"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-4xl font-semibold tracking-tight",
								children: card.jeju
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "탭하면 뜻이 보입니다"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl px-6 [backface-visibility:hidden] [transform:rotateY(180deg)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "표준어"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-4xl font-semibold tracking-tight",
								children: card.standard
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "탭하면 제주말로 돌아갑니다"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				className: "w-full",
				onClick: () => void playAudio(card.soundUrl).catch(() => void 0),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), "발음 듣기"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "lg",
					onClick: onAgain,
					children: "아직 몰라요"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "lg",
					onClick: onKnow,
					children: "이제 알아요"
				})]
			})
		]
	});
}
function AudioButton({ src, label = "듣기", large = false, autoPlay = false }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setFailed(false);
		setPlaying(false);
		stopAudio();
		if (!autoPlay) return;
		let cancelled = false;
		playAudio(src).then(() => {
			if (!cancelled) setPlaying(false);
		});
		setPlaying(true);
		return () => {
			cancelled = true;
			stopAudio();
		};
	}, [src, autoPlay]);
	async function onPlay() {
		setFailed(false);
		setPlaying(true);
		try {
			await playAudio(src);
		} catch {
			setFailed(true);
		} finally {
			setPlaying(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: large ? "lg" : "default",
			variant: large ? "default" : "outline",
			onClick: () => void onPlay(),
			className: cn(large && "h-16 min-w-40 rounded-xl px-8 text-base"),
			"aria-label": label,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: cn(large ? "size-5" : "size-4", playing && "animate-pulse") }), label]
		}), failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-danger",
			children: "소리를 재생할 수 없습니다"
		}) : null]
	});
}
function QuizView({ questions, onFinished, onMiss }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [correctCount, setCorrectCount] = (0, import_react.useState)(0);
	const [missed, setMissed] = (0, import_react.useState)([]);
	const question = questions[index];
	if (!question) return null;
	const answered = picked !== null;
	const progress = (index + (answered ? 1 : 0)) / questions.length * 100;
	const isLast = index + 1 >= questions.length;
	function choose(choice) {
		if (picked) return;
		setPicked(choice);
		if (choice === question.answer) {
			setCorrectCount((value) => value + 1);
			return;
		}
		setMissed((value) => value.includes(question.word.seq) ? value : [...value, question.word.seq]);
		onMiss(question);
	}
	function next() {
		if (isLast) {
			onFinished({
				correct: correctCount,
				missedSeqs: missed
			});
			return;
		}
		setIndex((value) => value + 1);
		setPicked(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium tabular-nums text-muted-foreground",
					children: [
						index + 1,
						" / ",
						questions.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: question.kind === "listen" ? "듣고 고르기" : "읽고 고르기"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-h-40 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-5 py-8 text-center",
				children: question.kind === "listen" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: question.prompt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioButton, {
						src: question.word.soundUrl,
						large: true
					}),
					answered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-semibold tracking-tight",
						children: question.word.jeju
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "소리를 듣고 뜻을 고르세요"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: question.prompt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-semibold tracking-tight",
						children: question.word.standard
					}),
					answered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioButton, {
						src: question.word.soundUrl,
						label: "발음 듣기"
					}) : null
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: question.choices.map((choice) => {
					const showCorrect = answered && choice === question.answer;
					const showWrong = answered && choice === picked && choice !== question.answer;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => choose(choice),
						disabled: answered,
						className: cn("flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-base transition-colors duration-[var(--motion-quick)]", !answered && "border-border bg-card hover:bg-muted", showCorrect && "border-success bg-success/10 text-success", showWrong && "border-danger bg-danger/10 text-danger", answered && !showCorrect && !showWrong && "border-border bg-card opacity-50"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: choice }),
							showCorrect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : null,
							showWrong ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : null
						]
					}, choice);
				})
			}),
			answered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				className: "w-full",
				onClick: next,
				children: isLast ? "결과 보기" : "다음"
			}) : null
		]
	});
}
function shuffle(items) {
	const next = [...items];
	for (let i = next.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		const tmp = next[i];
		next[i] = next[j];
		next[j] = tmp;
	}
	return next;
}
function levenshtein(a, b) {
	const rows = a.length + 1;
	const cols = b.length + 1;
	const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
	for (let i = 0; i < rows; i += 1) dp[i][0] = i;
	for (let j = 0; j < cols; j += 1) dp[0][j] = j;
	for (let i = 1; i < rows; i += 1) for (let j = 1; j < cols; j += 1) {
		const cost = a[i - 1] === b[j - 1] ? 0 : 1;
		dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
	}
	return dp[a.length][b.length];
}
function tooSimilar(a, b) {
	const max = Math.max(a.length, b.length);
	if (max === 0) return true;
	if (a === b) return true;
	return levenshtein(a, b) / max <= .34;
}
function pickDistractors(answer, preferred, fallback, count) {
	const chosen = [];
	const seen = /* @__PURE__ */ new Set([answer]);
	const take = (pool) => {
		for (const option of shuffle(pool)) {
			if (chosen.length >= count) return;
			if (seen.has(option)) continue;
			if (tooSimilar(option, answer)) continue;
			if (chosen.some((item) => tooSimilar(item, option))) continue;
			seen.add(option);
			chosen.push(option);
		}
	};
	take(preferred);
	take(fallback);
	return chosen;
}
function buildLesson(unit) {
	const sameUnit = unit.words;
	const samePos = (word) => units.flatMap((item) => item.words).filter((item) => item.seq !== word.seq && item.partOfSpeech === word.partOfSpeech);
	const listen = sameUnit.map((word) => {
		const preferred = sameUnit.filter((item) => item.seq !== word.seq).map((item) => item.standard);
		const fallback = samePos(word).map((item) => item.standard);
		const distractors = pickDistractors(word.standard, preferred, fallback, 3);
		return {
			id: `${word.seq}-listen`,
			kind: "listen",
			word,
			unitId: unit.id,
			prompt: "이 말의 뜻은 무엇일까요?",
			answer: word.standard,
			choices: shuffle([word.standard, ...distractors])
		};
	});
	const read = sameUnit.map((word) => {
		const preferred = sameUnit.filter((item) => item.seq !== word.seq).map((item) => item.jeju);
		const fallback = samePos(word).map((item) => item.jeju);
		const distractors = pickDistractors(word.jeju, preferred, fallback, 3);
		return {
			id: `${word.seq}-read`,
			kind: "read",
			word,
			unitId: unit.id,
			prompt: "이 뜻을 제주말로 하면?",
			answer: word.jeju,
			choices: shuffle([word.jeju, ...distractors])
		};
	});
	return [...shuffle(listen), ...shuffle(read)];
}
function buildReviewQuiz(words, unitIdBySeq) {
	if (words.length === 0) return [];
	const pool = units.flatMap((unit) => unit.words);
	return shuffle(words).flatMap((word) => {
		const others = pool.filter((item) => item.seq !== word.seq);
		const meaningChoices = pickDistractors(word.standard, others.map((item) => item.standard), [], 3);
		const jejuChoices = pickDistractors(word.jeju, others.map((item) => item.jeju), [], 3);
		const unitId = unitIdBySeq[word.seq] ?? "";
		return [{
			id: `${word.seq}-review-listen`,
			kind: "listen",
			word,
			unitId,
			prompt: "이 말의 뜻은 무엇일까요?",
			answer: word.standard,
			choices: shuffle([word.standard, ...meaningChoices])
		}, {
			id: `${word.seq}-review-read`,
			kind: "read",
			word,
			unitId,
			prompt: "이 뜻을 제주말로 하면?",
			answer: word.jeju,
			choices: shuffle([word.jeju, ...jejuChoices])
		}];
	});
}
var Route$1 = createFileRoute("/review")({ component: ReviewPage });
function sortCards(wrongBySeq) {
	return Object.values(wrongBySeq).sort((a, b) => {
		if (b.timesMissed !== a.timesMissed) return b.timesMissed - a.timesMissed;
		return b.addedAt - a.addedAt;
	});
}
function ReviewPage() {
	const hydrated = useProgress((state) => state.hydrated);
	const wrongBySeq = useProgress((state) => state.wrongBySeq);
	const dismissWrong = useProgress((state) => state.dismissWrong);
	const recordMiss = useProgress((state) => state.recordMiss);
	const recordHit = useProgress((state) => state.recordHit);
	const [mode, setMode] = (0, import_react.useState)("cards");
	const [queue, setQueue] = (0, import_react.useState)(null);
	const [sessionTotal, setSessionTotal] = (0, import_react.useState)(0);
	const cards = (0, import_react.useMemo)(() => sortCards(wrongBySeq), [wrongBySeq]);
	const deck = queue ?? cards;
	const current = deck[0];
	const quizQuestions = (0, import_react.useMemo)(() => {
		if (mode !== "quiz") return [];
		return buildReviewQuiz(cards.map((card) => getWord(card.seq)?.word).filter((word) => Boolean(word)), Object.fromEntries(cards.map((card) => [card.seq, card.unitId])));
	}, [mode, cards]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-muted" });
	if (cards.length === 0 && mode !== "quiz") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: "오답 카드"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-sm text-muted-foreground",
				children: "틀린 말이 없습니다. 유닛 퀴즈에서 틀리면 카드가 여기 쌓입니다. 뒤집고, 듣고, 외운 뒤 빼면 됩니다."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }), "배우러 가기"]
				})
			})
		]
	});
	if (mode === "quiz") {
		if (quizQuestions.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 py-16 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "복습할 오답이 없습니다"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "홈으로"
				})
			})]
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "오답 복습"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: "퀴즈"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizView, {
				questions: quizQuestions,
				onMiss: (question) => recordMiss(question.word, question.unitId),
				onFinished: (result) => {
					const missed = new Set(result.missedSeqs);
					for (const question of quizQuestions) if (!missed.has(question.word.seq)) recordHit(question.word.seq);
					setMode("done");
				}
			})]
		});
	}
	if (!current || mode === "done") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: "오늘 복습 끝"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "남은 오답은 오답 탭에서 다시 볼 수 있습니다."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "홈으로"
				})
			})
		]
	});
	function know() {
		if (!current) return;
		dismissWrong(current.seq);
		const rest = deck.slice(1);
		setQueue(rest);
		setSessionTotal((value) => value || cards.length);
		if (rest.length === 0) setMode("done");
	}
	function again() {
		if (!current) return;
		const rest = [...deck.slice(1), current];
		setQueue(rest);
		setSessionTotal((value) => value || cards.length);
	}
	const total = sessionTotal || cards.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "틀린 말을 뒤집으며 외우기"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: "오답 카드"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => setMode("quiz"),
				children: "퀴즈로 확인"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flashcard, {
			card: current,
			remaining: deck.length,
			total,
			onKnow: know,
			onAgain: again
		}, current.seq)]
	});
}
var $$splitComponentImporter = () => import("./learn._unitId-MU29TmV1.mjs");
var Route = createFileRoute("/learn/$unitId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	ReviewRoute: Route$1.update({
		id: "/review",
		path: "/review",
		getParentRoute: () => Route$3
	}),
	LearnUnitIdRoute: Route.update({
		id: "/learn/$unitId",
		path: "/learn/$unitId",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { useProgress as _, playAudio as a, Progress as c, cn as d, formatUnitNumber as f, unitsInChapter as g, units as h, QuizView as i, TOTAL_UNITS as l, nextUnit as m, Route as n, Button as o, getUnit as p, buildLesson as r, CHAPTERS as s, router_exports as t, TOTAL_WORDS as u };
