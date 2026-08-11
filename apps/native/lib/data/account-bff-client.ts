import type { AccountSession } from "./types";

type AccountBffRequestOptions = {
	method?: string;
	body?: unknown;
	token?: string | null;
};

export type AccountLoginUrlResult = {
	url: string;
	state: string;
};

export type AccountOAuthCallbackInput = {
	code: string;
	state: string;
};

export type AccountGraphqlRequest = {
	query: string;
	variables?: Record<string, unknown>;
};

type FetchLike = typeof globalThis.fetch;

export async function accountBffRequest<T>(
	baseUrl: string,
	path: string,
	options: AccountBffRequestOptions = {},
): Promise<T> {
	const requestFetch = await getAccountFetch();
	const response = await requestFetch(`${baseUrl}${path}`, {
		method: options.method ?? "GET",
		headers: {
			"Content-Type": "application/json",
			...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
		},
		credentials: "include",
		body: options.body ? JSON.stringify(options.body) : undefined,
	});

	if (!response.ok) {
		const message = await readErrorMessage(response);
		throw new Error(message || `Account request failed: ${response.status}`);
	}

	if (response.status === 204) return undefined as T;

	const text = await response.text();
	if (!text) return undefined as T;
	return JSON.parse(text) as T;
}

export function requestAccountLoginUrl(baseUrl: string) {
	return accountBffRequest<AccountLoginUrlResult>(baseUrl, "/account/login-url", {
		method: "POST",
	});
}

export function completeAccountOAuth(baseUrl: string, input: AccountOAuthCallbackInput) {
	return accountBffRequest<AccountSession>(baseUrl, "/account/callback", {
		method: "POST",
		body: input,
	});
}

export function requestAccountGraphql<T>(baseUrl: string, input: AccountGraphqlRequest) {
	return accountBffRequest<T>(baseUrl, "/account/graphql", {
		method: "POST",
		body: input,
	});
}

async function getAccountFetch(): Promise<FetchLike> {
	if (isReactNativeRuntime()) {
		const module = (await import("react-native-nitro-fetch")) as { fetch?: FetchLike };
		return module.fetch ?? globalThis.fetch;
	}

	return globalThis.fetch;
}

function isReactNativeRuntime() {
	return typeof navigator !== "undefined" && navigator.product === "ReactNative";
}

async function readErrorMessage(response: Response) {
	try {
		const text = await response.text();
		if (!text) return "";
		const payload = JSON.parse(text) as { message?: string; error?: string };
		return payload.message ?? payload.error ?? text;
	} catch {
		return response.statusText;
	}
}
