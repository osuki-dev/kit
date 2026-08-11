import type { KitModuleDefinition, KitModuleRoute } from "./module-types";

export type AccountAuthProvider = "email" | "google" | "apple" | "github";

export interface AccountModuleOptions {
	routePrefix?: string;
	providers?: AccountAuthProvider[];
	enableRegistration?: boolean;
	enableProfile?: boolean;
	enableForgotPassword?: boolean;
	requireName?: boolean;
}

const joinPath = (prefix: string, path: string) =>
	`${prefix.replace(/\/$/, "")}/${path.replace(/^\//, "")}`.replace(/\/+/g, "/");

export function createAccountModule(options: AccountModuleOptions = {}): KitModuleDefinition {
	const routePrefix = options.routePrefix ?? "";
	const providers = options.providers ?? ["email"];
	const enableRegistration = options.enableRegistration ?? true;
	const enableProfile = options.enableProfile ?? true;
	const enableForgotPassword = options.enableForgotPassword ?? true;

	const routes: KitModuleRoute[] = [
		{
			id: "account.login",
			path: joinPath(routePrefix, "/login"),
			label: "Sign in",
			screen: "LoginScreen",
			icon: "LogIn",
			required: true,
		},
	];

	if (enableRegistration) {
		routes.push({
			id: "account.register",
			path: joinPath(routePrefix, "/register"),
			label: "Create account",
			screen: "RegisterScreen",
			icon: "UserPlus",
		});
	}

	if (enableProfile) {
		routes.push({
			id: "account.profile",
			path: joinPath(routePrefix, "/account"),
			label: "Account",
			screen: "ProfileScreen",
			icon: "User",
			tab: true,
		});
	}

	return {
		id: "account",
		title: "Account",
		description: "Authentication, registration, profile, and user identity screens.",
		audience: "public",
		screens: [
			"LoginScreen",
			...(enableRegistration ? (["RegisterScreen"] as const) : []),
			...(enableProfile ? (["ProfileScreen"] as const) : []),
		],
		routes,
		capabilities: [
			{
				id: "account.emailAuth",
				label: "Email authentication",
				description: "Email and password sign-in flow.",
				required: providers.includes("email"),
			},
			...providers
				.filter((provider) => provider !== "email")
				.map((provider) => ({
					id: `account.${provider}Auth`,
					label: `${provider[0]!.toUpperCase()}${provider.slice(1)} authentication`,
					description: `Social authentication with ${provider}.`,
				})),
			{
				id: "account.registration",
				label: "Registration",
				description:
					options.requireName === false ? "Email registration." : "Name and email registration.",
				required: enableRegistration,
			},
			{
				id: "account.forgotPassword",
				label: "Forgot password",
				description: "Password reset entry point.",
				required: enableForgotPassword,
			},
			{
				id: "account.profile",
				label: "Profile",
				description: "User profile and account summary.",
				required: enableProfile,
			},
		],
		e2eFlows: ["auth-validation", "account-signup-signout-flow"],
	};
}
