import { describe, expect, it } from "bun:test";
import appConfig from "./app.json";
import pkg from "./package.json";

describe("Showcase App Contracts", () => {
	it("exposes consistent package metadata", () => {
		expect(pkg.name).toBe("showcase");
		expect(pkg.version).toBe("2.0.0");
		expect(pkg.main).toBe("expo-router/entry");
	});

	it("configures Expo bundle identifier and scheme", () => {
		expect(appConfig.expo.name).toBe("Osuki Kit Showcase");
		expect(appConfig.expo.slug).toBe("osuki-showcase");
		expect(appConfig.expo.scheme).toBe("osuki-showcase");
		expect(appConfig.expo.android.package).toBe("dev.osuki.showcase");
	});

	it("declares UI and Kit-Community workspace dependencies", () => {
		expect(pkg.dependencies["@osuki-dev/ui"]).toBe("workspace:*");
		expect(pkg.dependencies["@osuki-dev/kit-community"]).toBe("workspace:*");
	});
});
