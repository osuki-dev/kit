import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

// Documentation drifted silently before: components shipped for months without
// an entry, and the roadmap's own release condition ("public docs cover every
// exported component") had no way to be checked. This fails the build instead.

const repoRoot = new URL("..", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, repoRoot), "utf8");

const componentsIndex = read("packages/ui/src/components/index.ts");
const componentDocs = read("docs/ui/components.md");
const packageReadme = read("packages/ui/README.md");

// Compound children are documented under their parent, not as separate entries.
const compoundParents = ["Dialog", "Modal", "Sheet", "Tabs"];
const isCompoundChild = (name: string) =>
	compoundParents.some(
		(parent) => name !== parent && name !== `${parent}s` && name.startsWith(parent),
	);

function exportedComponents(source: string) {
	const names = new Set<string>();
	for (const match of source.matchAll(/export\s+(type\s+)?\{([^}]*)\}/g)) {
		const groupIsTypeOnly = Boolean(match[1]);
		for (const entry of (match[2] ?? "").split(",")) {
			const raw = entry.trim();
			if (!raw) continue;
			// A type-only export is not a component, whether marked on the group
			// (`export type { … }`) or inline (`export { type Foo }`).
			if (groupIsTypeOnly || raw.startsWith("type ")) continue;
			const name =
				raw
					.split(/\s+as\s+/)
					.pop()
					?.trim() ?? "";
			if (!/^[A-Z]/.test(name)) continue;
			if (isCompoundChild(name)) continue;
			names.add(name);
		}
	}
	return [...names].sort();
}

const components = exportedComponents(componentsIndex);
assert.ok(components.length > 0, "found no exported components to check");

const mentions = (haystack: string, name: string) => new RegExp(`\\b${name}\\b`).test(haystack);

const undocumented = components.filter((name) => !mentions(componentDocs, name));
assert.deepEqual(undocumented, [], `docs/ui/components.md is missing: ${undocumented.join(", ")}`);

const unlisted = components.filter((name) => !mentions(packageReadme, name));
assert.deepEqual(unlisted, [], `packages/ui/README.md is missing: ${unlisted.join(", ")}`);

console.log(`[docs-coverage] PASS (${components.length} components)`);
