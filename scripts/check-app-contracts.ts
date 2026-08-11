import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

// Application-level contracts that a package cannot assert about its consumers.
// Keep these here rather than inside packages/ui: a published package must not
// read application source, and doing so previously coupled the public package
// to a private app.
const appRootLayouts = ["apps/native/app/_layout.tsx"] as const;

const repoRoot = new URL("..", import.meta.url);

for (const path of appRootLayouts) {
	const source = readFileSync(new URL(path, repoRoot), "utf8");
	assert.ok(
		source.includes("<ToastProvider"),
		`${path} must mount <ToastProvider> so useToast works app-wide`,
	);
}

console.log(`[app-contracts] PASS (${appRootLayouts.length} app)`);
