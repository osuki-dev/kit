import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

// Two settings decide whether a `minor` changeset actually ships as a minor.
// Both failed silently before, and the only visible symptom was a version
// number in the release PR that nobody was checking.
//
// `onlyUpdatePeerDependentsWhenOutOfRange` is read only from inside
// `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH`. Written at the top level
// it still validates against the schema and is then ignored, which leaves the
// default rule in force: `@osuki-dev/ui` is a peer dependency of
// `@osuki-dev/kit-community`, so bumping `ui` bumps `kit-community` to a major,
// and `fixed` drags `ui` to that major too. #2 shipped 0.3.0 as 1.0.0 that way,
// and #9 would have shipped a minor as 2.0.0.
//
// The `@osuki-dev/ui` peer range must keep an upper bound. changesets rewrites
// internal ranges on every bump and preserves a bound only for a form it
// understands; a bare `>=` loses it, and has drifted back there once already.
//
// This asserts the shape rather than dry-running `changeset version`: `status`
// and `version` both need base-branch git context that is not reliably present
// wherever this check runs.

const repoRoot = new URL("..", import.meta.url);
const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, repoRoot), "utf8"));

const config = readJson(".changeset/config.json");
const experimental = config.___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH ?? {};

assert.equal(
	config.onlyUpdatePeerDependentsWhenOutOfRange,
	undefined,
	"onlyUpdatePeerDependentsWhenOutOfRange at the top level of .changeset/config.json is ignored — nest it under ___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH",
);

assert.equal(
	experimental.onlyUpdatePeerDependentsWhenOutOfRange,
	true,
	"___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.onlyUpdatePeerDependentsWhenOutOfRange must be true, or every minor changeset ships as a major",
);

const peerRange = readJson("packages/kit-community/package.json").peerDependencies?.[
	"@osuki-dev/ui"
];

assert.match(
	peerRange ?? "",
	/^\^/,
	`@osuki-dev/ui must be a caret peer range so it keeps an upper bound, got ${peerRange}`,
);

console.log(`[changeset-config] PASS (peer range ${peerRange})`);
