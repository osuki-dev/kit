import { strict as assert } from "node:assert";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const outDir = join(repoRoot, "dist", "package-smoke");

const packages = [
	{
		name: "@osuki-dev/ui",
		cwd: join(repoRoot, "packages", "ui"),
		archive: "osuki-dev-ui.tgz",
		requiredEntries: [
			"package/package.json",
			"package/README.md",
			"package/src/index.ts",
			"package/src/fonts/font-loader.tsx",
			"package/lib/index.js",
			"package/lib/index.d.ts",
		],
		forbiddenEntryPatterns: [
			/\.(?:otf|ttf|woff2?)$/i,
			/(?:^|\/)(?:__tests__\/|[^/]+\.(?:test|spec)\.[^/]+$)/i,
		],
	},
	{
		name: "@osuki-dev/kit-community",
		cwd: join(repoRoot, "packages", "kit-community"),
		archive: "osuki-dev-kit-community.tgz",
		requiredEntries: [
			"package/package.json",
			"package/README.md",
			"package/src/index.ts",
			"package/src/modules/scaffold-composer.ts",
			"package/lib/index.js",
			"package/lib/index.d.ts",
		],
		forbiddenEntryPatterns: undefined,
	},
] as const;

async function run(command: string[], cwd: string) {
	const child = Bun.spawn(command, {
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, code] = await Promise.all([
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
		child.exited,
	]);
	if (code !== 0) {
		throw new Error(`${command.join(" ")} failed in ${cwd}\n${stdout}\n${stderr}`);
	}
	return stdout.trim();
}

function assertPublishableRuntimeDeps(packageJson: {
	dependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
}) {
	for (const field of ["dependencies", "peerDependencies", "optionalDependencies"] as const) {
		for (const [name, range] of Object.entries(packageJson[field] ?? {})) {
			assert.ok(
				!range.startsWith("workspace:"),
				`${field}.${name} must not use workspace protocol`,
			);
		}
	}
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const pkg of packages) {
	const packageJson = await Bun.file(join(pkg.cwd, "package.json")).json();
	assertPublishableRuntimeDeps(packageJson);

	const archivePath = join(outDir, pkg.archive);
	await run(
		["bun", "pm", "pack", "--filename", archivePath, "--ignore-scripts", "--quiet"],
		pkg.cwd,
	);
	const entries = (await run(["tar", "-tzf", archivePath], repoRoot)).split("\n");
	for (const entry of pkg.requiredEntries) {
		assert.ok(entries.includes(entry), `${pkg.name} archive includes ${entry}`);
	}
	for (const forbiddenEntryPattern of pkg.forbiddenEntryPatterns ?? []) {
		const forbiddenEntry = entries.find((entry) => forbiddenEntryPattern.test(entry));
		assert.equal(
			forbiddenEntry,
			undefined,
			`${pkg.name} archive excludes ${forbiddenEntryPattern}`,
		);
	}
	console.log(`[package-smoke] ${pkg.name} archive=${archivePath}`);
}

console.log("[package-smoke] PASS");
