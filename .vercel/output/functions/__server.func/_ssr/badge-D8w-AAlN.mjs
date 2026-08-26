import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { d as cn } from "./router-BemPB9vY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-D8w-AAlN.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		muted: "border-transparent bg-muted text-muted-foreground",
		outline: "border-border text-foreground",
		success: "border-transparent bg-success/12 text-success",
		danger: "border-transparent bg-danger/12 text-danger"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
