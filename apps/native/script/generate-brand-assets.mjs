import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = resolve(root, "assets/brand");
const imageDir = resolve(root, "assets/images");

mkdirSync(imageDir, { recursive: true });

const rsvg = "/opt/homebrew/bin/rsvg-convert";

function render(input, output, size) {
	execFileSync(rsvg, [
		"--format",
		"png",
		"--width",
		String(size),
		"--height",
		String(size),
		"--output",
		resolve(imageDir, output),
		resolve(brandDir, input),
	]);
}

render("osuki-icon.svg", "icon.png", 1024);
render("osuki-foreground.svg", "splash-icon.png", 1024);
render("osuki-background.svg", "android-icon-background.png", 512);
render("osuki-foreground.svg", "android-icon-foreground.png", 512);
render("osuki-monochrome.svg", "android-icon-monochrome.png", 432);
render("osuki-icon.svg", "favicon.png", 48);

console.log("Generated Osuki brand assets.");
