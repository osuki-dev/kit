/**
 * The package's tests run under bun, but the package itself must not carry
 * bun's types as a dependency: it publishes to Metro and to Node consumers who
 * have no reason to install them. Only the two entry points the tests actually
 * use are declared here.
 */
declare module "bun:test" {
	export function test(name: string, fn: () => void | Promise<void>): void;
	export const mock: {
		module(specifier: string, factory: () => unknown): void;
	};
}
