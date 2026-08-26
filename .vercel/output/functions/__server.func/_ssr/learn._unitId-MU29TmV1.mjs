import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as RotateCcw, l as ArrowLeft, n as Volume2 } from "../_libs/lucide-react.mjs";
import { _ as useProgress, a as playAudio, f as formatUnitNumber, i as QuizView, m as nextUnit, n as Route, o as Button, p as getUnit, r as buildLesson } from "./router-BemPB9vY.mjs";
import { t as Badge } from "./badge-D8w-AAlN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn._unitId-MU29TmV1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LearnPage() {
	const { unitId } = Route.useParams();
	const unit = getUnit(unitId);
	const hydrated = useProgress((state) => state.hydrated);
	const unlocked = useProgress((state) => state.isUnlocked(unitId));
	const completeUnit = useProgress((state) => state.completeUnit);
	const recordMiss = useProgress((state) => state.recordMiss);
	const recordHit = useProgress((state) => state.recordHit);
	const [phase, setPhase] = (0, import_react.useState)("intro");
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [score, setScore] = (0, import_react.useState)({
		correct: 0,
		total: 0,
		missedSeqs: []
	});
	const following = unit ? nextUnit(unit.id) : void 0;
	if (!unit) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "없는 유닛입니다"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				children: "홈으로"
			})
		})]
	});
	const currentUnit = unit;
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-muted" });
	if (!unlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "아직 잠긴 유닛입니다"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				children: "홈으로"
			})
		})]
	});
	function start() {
		setQuestions(buildLesson(currentUnit));
		setPhase("quiz");
	}
	function finish(result) {
		completeUnit(currentUnit.id);
		for (const word of currentUnit.words) if (!result.missedSeqs.includes(word.seq)) recordHit(word.seq);
		setScore({
			...result,
			total: questions.length
		});
		setPhase("results");
	}
	if (phase === "quiz") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: `${formatUnitNumber(currentUnit.order)} · ${currentUnit.title}`,
			title: "퀴즈"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizView, {
			questions,
			onMiss: (question) => recordMiss(question.word, currentUnit.id),
			onFinished: finish
		})]
	});
	if (phase === "results") {
		const missedWords = currentUnit.words.filter((word) => score.missedSeqs.includes(word.seq));
		const percent = score.total ? Math.round(score.correct / score.total * 100) : 0;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
					kicker: currentUnit.title,
					title: "결과"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card px-5 py-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "맞힌 문제"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-display text-5xl font-semibold tabular-nums tracking-tight",
							children: [score.correct, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-2xl text-muted-foreground",
								children: ["/", score.total]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: [percent, "%"]
						})
					]
				}),
				missedWords.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-medium",
								children: "틀린 말"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "danger",
								children: [missedWords.length, "개"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordList, { words: missedWords }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/review",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "오답 카드 복습"]
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-sm text-muted-foreground",
					children: "이 유닛은 전부 맞혔습니다."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [following ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/learn/$unitId",
							params: { unitId: following.id },
							children: ["다음 유닛 · ", following.title]
						})
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: "유닛 목록"
						})
					})]
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				kicker: `유닛 ${formatUnitNumber(currentUnit.order)}`,
				title: currentUnit.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "단어를 들어 본 뒤 듣기 10문제, 읽기 10문제를 풉니다. 틀리면 오답 카드에 모입니다."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordList, { words: currentUnit.words }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				className: "w-full",
				onClick: start,
				children: "퀴즈 시작"
			})
		]
	});
}
function WordList({ words }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-border rounded-2xl border border-border bg-card",
		children: words.map((word) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-3 px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-muted",
					onClick: () => void playAudio(word.soundUrl).catch(() => void 0),
					"aria-label": `${word.jeju} 발음 듣기`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 font-medium",
					children: word.jeju
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: word.standard
				})
			]
		}, word.seq))
	});
}
function PageHeader({ kicker, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "ghost",
			size: "icon",
			className: "-ml-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				"aria-label": "뒤로",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: kicker
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold tracking-tight",
			children: title
		})] })]
	});
}
//#endregion
export { LearnPage as component };
