#!/usr/bin/env node

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const usage = `
Usage:
  node ./e2e/run-agent-device.mjs maestro ios [smoke] [-- extra agent-device args]
  node ./e2e/run-agent-device.mjs maestro android [smoke] [-- extra agent-device args]
  node ./e2e/run-agent-device.mjs generated ios [-- extra agent-device args]
  node ./e2e/run-agent-device.mjs generated android [-- extra agent-device args]
  node ./e2e/run-agent-device.mjs replay ios [-- extra agent-device args]
  node ./e2e/run-agent-device.mjs replay android [-- extra agent-device args]
`;

const [kind, platform, maybeTarget, ...rest] = process.argv.slice(2);
const defaultTarget = kind === "maestro" ? "smoke" : "all";
const target = maybeTarget && !maybeTarget.startsWith("-") ? maybeTarget : defaultTarget;
const rawExtraArgs = maybeTarget && maybeTarget.startsWith("-") ? [maybeTarget, ...rest] : rest;
const separatorIndex = rawExtraArgs.indexOf("--");
const extraArgs = separatorIndex >= 0 ? rawExtraArgs.slice(separatorIndex + 1) : rawExtraArgs;

if (!["maestro", "generated", "replay"].includes(kind) || !["ios", "android"].includes(platform)) {
	console.error(usage.trim());
	process.exit(1);
}

const artifactsDir = `e2e/artifacts/${kind}-${platform}-${target}`;
const junitPath = `${artifactsDir}/junit.xml`;

const hasFiles = (dir, extension) => {
	if (!existsSync(dir)) {
		return false;
	}

	return readdirSync(dir, { withFileTypes: true }).some((entry) => {
		const path = join(dir, entry.name);

		return entry.isDirectory() ? hasFiles(path, extension) : entry.name.endsWith(extension);
	});
};

const resolvePaths = () => {
	if (kind === "maestro") {
		const dir = `e2e/maestro/${platform}`;

		if (!hasFiles(dir, ".yaml")) {
			console.error(`No Maestro flows found in ${dir}.`);
			process.exit(1);
		}

		return [`${dir}/*.yaml`];
	}

	if (kind === "generated") {
		if (!hasFiles("e2e/generated", ".yaml")) {
			console.error("No generated flows found. Run `bun run e2e:generate` first.");
			process.exit(1);
		}

		return ["e2e/generated/*.yaml"];
	}

	const dir = `e2e/replay/${platform}`;

	if (!hasFiles(dir, ".ad")) {
		console.error(
			`No replay scripts found in ${dir}. Record one with agent-device --save-script first.`,
		);
		process.exit(1);
	}

	return [dir];
};

const args = [
	"test",
	...resolvePaths(),
	"--platform",
	platform,
	"--artifacts-dir",
	artifactsDir,
	"--report-junit",
	junitPath,
	"--session",
	`${kind}-${platform}-${target}`,
];

if (kind === "maestro" || kind === "generated") {
	args.push("--maestro");
}

const result = spawnSync("agent-device", [...args, ...extraArgs], {
	stdio: "inherit",
});

if (result.error) {
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 1);
