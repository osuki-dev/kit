import { BffAccountAdapter } from "./bff-account-adapter";
import { LocalAccountAdapter } from "./local-account-adapter";
import type { AccountDataAdapter } from "./types";

const accountBffUrl = process.env.EXPO_PUBLIC_OSUKI_ACCOUNT_BFF_URL;

export type AccountAdapterKind = "local" | "bff";

export type AccountAdapterFactoryResult = {
	adapter: AccountDataAdapter;
	kind: AccountAdapterKind;
};

export type AccountAdapterFactoryOptions = {
	accountBffUrl?: string;
};

export function createDefaultAccountAdapter(
	localStore: AccountDataAdapter,
	options: AccountAdapterFactoryOptions = {},
): AccountAdapterFactoryResult {
	const baseUrl = options.accountBffUrl ?? accountBffUrl;

	if (baseUrl) {
		return {
			adapter: new BffAccountAdapter({
				baseUrl,
			}),
			kind: "bff",
		};
	}

	return {
		adapter: new LocalAccountAdapter(localStore),
		kind: "local",
	};
}
