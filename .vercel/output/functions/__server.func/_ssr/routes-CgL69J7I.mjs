import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Lock, i as RotateCcw, o as ChevronRight, s as Check } from "../_libs/lucide-react.mjs";
import { _ as useProgress, c as Progress, d as cn, f as formatUnitNumber, g as unitsInChapter, h as units, l as TOTAL_UNITS, o as Button, s as CHAPTERS, u as TOTAL_WORDS } from "./router-BemPB9vY.mjs";
import { t as Badge } from "./badge-D8w-AAlN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CgL69J7I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-2xl border border-border bg-card text-card-foreground", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col gap-1.5 p-5", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
	ref,
	className: cn("font-display text-lg font-semibold leading-snug", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-5 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
function Home() {
	const hydrated = useProgress((state) => state.hydrated);
	const completed = useProgress((state) => state.completedUnitIds);
	const isUnlocked = useProgress((state) => state.isUnlocked);
	const wrongCount = useProgress((state) => Object.keys(state.wrongBySeq).length);
	const continueId = useProgress((state) => {
		if (state.lastPlayedUnitId && !state.completedUnitIds.includes(state.lastPlayedUnitId)) return state.lastPlayedUnitId;
		return units.find((unit) => !state.completedUnitIds.includes(unit.id))?.id ?? units[0].id;
	});
	const continueUnit = units.find((unit) => unit.id === continueId) ?? units[0];
	const doneCount = completed.length;
	const learnedWords = doneCount * 10;
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-muted" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted-foreground",
					children: "소리로 배우는 제주어"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-4xl font-semibold tracking-tight",
					children: "제주말"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col gap-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "진행"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-display text-2xl font-semibold tabular-nums",
							children: [doneCount, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-base font-medium text-muted-foreground",
								children: [
									" / ",
									TOTAL_UNITS,
									" 유닛"
								]
							})]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm tabular-nums text-muted-foreground",
							children: [
								learnedWords,
								" / ",
								TOTAL_WORDS,
								" 단어"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: doneCount / TOTAL_UNITS * 100 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						className: "w-full justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/learn/$unitId",
							params: { unitId: continueUnit.id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: completed.includes(continueUnit.id) ? "다시 풀기" : "이어서 배우기" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-normal opacity-80",
								children: [
									formatUnitNumber(continueUnit.order),
									" ",
									continueUnit.title
								]
							})]
						})
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/review",
				className: "flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 items-center justify-center rounded-xl bg-muted text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "오답 카드"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: wrongCount > 0 ? "틀린 말을 뒤집으며 복습" : "퀴즈에서 틀린 말이 여기 모입니다"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1 text-sm font-medium",
					children: [wrongCount > 0 ? `${wrongCount}장` : "비어 있음", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "유닛"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "앞에서부터 열립니다"
					})]
				}), CHAPTERS.map((chapter) => {
					const chapterUnits = unitsInChapter(chapter);
					const chapterDone = chapterUnits.filter((unit) => completed.includes(unit.id)).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-medium tracking-wide text-muted-foreground",
								children: chapter.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs tabular-nums text-muted-foreground",
								children: [
									chapterDone,
									"/",
									chapterUnits.length
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "flex flex-col gap-2",
							children: chapterUnits.map((unit) => {
								const unlocked = isUnlocked(unit.id);
								const done = completed.includes(unit.id);
								const rowClass = "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card px-3 py-3";
								const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("flex size-10 items-center justify-center rounded-lg font-display text-sm font-semibold tabular-nums", done ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"),
										children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : formatUnitNumber(unit.order)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate font-medium",
											children: unit.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs text-muted-foreground",
											children: "단어 10개"
										})]
									}),
									done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "success",
										children: "완료"
									}) : unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-muted-foreground" })
								] });
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/learn/$unitId",
									params: { unitId: unit.id },
									className: rowClass,
									children: inner
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn(rowClass, "opacity-50"),
									children: inner
								}) }, unit.id);
							})
						})]
					}, chapter.id);
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
