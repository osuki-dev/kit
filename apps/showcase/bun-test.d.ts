declare module "bun:test" {
	type TestCallback = () => void | Promise<void>;

	type Expectation<T> = {
		toBe(value: unknown): void;
		toEqual(value: unknown): void;
		toHaveLength(length: number): void;
		toBeTruthy(): void;
		toBeFalsy(): void;
	};

	export function describe(name: string, callback: TestCallback): void;
	export function it(name: string, callback: TestCallback): void;
	export function test(name: string, callback: TestCallback): void;
	export function beforeEach(callback: TestCallback): void;
	export function afterEach(callback: TestCallback): void;
	export function expect<T>(value: T): Expectation<T>;
}
