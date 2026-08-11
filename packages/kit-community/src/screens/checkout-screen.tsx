import React, { useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	type TextInputProps,
	type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Card,
	Text,
	Button,
	Icon,
	resolveFontStyle,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
	type IconName,
} from "@osuki-dev/ui";
import { useI18n } from "../i18n";

export type CheckoutStep = "shipping" | "payment" | "review";

export interface CheckoutScreenConfig {
	/** Current active step */
	currentStep: CheckoutStep;
	/** Order summary items */
	items: Array<{
		id: string;
		name: string;
		price: number;
		quantity: number;
	}>;
	/** Currency symbol */
	currency?: string;
	/** Subtotal */
	subtotal: number;
	/** Shipping cost */
	shipping: number;
	/** Tax amount */
	tax: number;
	/** Total */
	total: number;
	/** Defer shipping, tax, discounts, and the final total to an external checkout */
	externalPricing?: {
		label?: string;
		notice?: string;
	};
	/** Shipping address */
	shippingAddress?: {
		name: string;
		street: string;
		city: string;
		zip: string;
		country: string;
	};
	/** Shipping address change handler */
	onShippingAddressChange?: (address: NonNullable<CheckoutScreenConfig["shippingAddress"]>) => void;
	/** Optional helper shown above the shipping form, for example account default address state */
	shippingAddressNotice?: string;
	/** Optional checkout-level error shown above the active step */
	errorMessage?: string;
	/** Payment method */
	paymentMethod?: {
		type: "card" | "paypal" | "apple_pay";
		last4?: string;
		brand?: string;
	};
	/** Optional external payment handoff shown instead of local payment choices */
	paymentStep?: {
		type: "external";
		title: string;
		description: string;
		icon?: IconName;
		testID?: string;
	};
	/** Payment method change handler */
	onPaymentMethodChange?: (method: NonNullable<CheckoutScreenConfig["paymentMethod"]>) => void;
	/** Step change handler */
	onStepChange?: (step: CheckoutStep) => void;
	/** Place order handler */
	onPlaceOrder?: () => void;
	/** Disable the final submit while an order is being created */
	placingOrder?: boolean;
	/** Automation id for the primary continue button */
	continueTestID?: string;
	/** Automation id for the final place order button */
	placeOrderTestID?: string;
	/** Automation id for the checkout-level error */
	errorTestID?: string;
	/** Final review action label */
	placeOrderLabel?: string;
	/** Final review action label while submitting */
	placingOrderLabel?: string;
	/** Accessible label for the final review action */
	placeOrderAccessibilityLabel?: string;
}

export interface CheckoutScreenProps {
	config: CheckoutScreenConfig;
	/** Style overrides */
	styleOverrides?: {
		container?: ViewStyle;
		stepIndicator?: ViewStyle;
		content?: ViewStyle;
		summarySection?: ViewStyle;
	};
}

// Static styles
const staticStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	stepIndicator: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
		marginBottom: 16,
	},
	stepItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepNumber: {
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
	stepConnector: {
		width: 24,
		height: 1,
	},
	contentSection: {
		marginBottom: 12,
	},
	sectionTitle: {
		marginBottom: 8,
	},
	inputRow: {
		gap: 10,
		marginBottom: 10,
	},
	addressField: {
		flex: 1,
		gap: 6,
	},
	addressError: {
		alignSelf: "flex-start",
		maxWidth: "100%",
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	addressNotice: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderWidth: 1,
		borderRadius: 18,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginBottom: 12,
	},
	checkoutError: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		borderWidth: 1,
		borderRadius: 18,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginBottom: 12,
	},
	input: {
		height: 44,
		borderWidth: 1,
		borderRadius: 999,
		paddingHorizontal: 16,
		justifyContent: "center",
	},
	textInput: {
		flex: 1,
		minWidth: 0,
		padding: 0,
		paddingVertical: 0,
		includeFontPadding: false,
		textAlignVertical: "center",
	},
	summaryItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 12,
		paddingVertical: 6,
	},
	summaryItemName: {
		flex: 1,
		flexShrink: 1,
	},
	summaryItemPrice: {
		flexShrink: 0,
		textAlign: "right",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		gap: 12,
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
	},
	totalAmount: {
		flexShrink: 1,
		textAlign: "right",
	},
	paymentMethod: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 16,
		borderRadius: 18,
	},
	externalPayment: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
		padding: 16,
		borderRadius: 18,
	},
	externalPaymentIcon: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: "center",
		justifyContent: "center",
	},
	actionsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	scrollContent: {
		paddingBottom: 24,
	},
	stickyActions: {
		flexShrink: 0,
	},
	stickyActionsBackground: {
		paddingVertical: 8,
	},
	footerButton: {
		minHeight: 52,
		paddingHorizontal: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	footerPrimaryButton: {
		flex: 1,
	},
});

/**
 * Checkout screen template
 *
 * Features:
 * - Multi-step checkout flow (shipping, payment, review)
 * - Step indicator
 * - Order summary sidebar
 * - Address form
 * - Payment method selection
 * - Fully customizable styles
 *
 * @example
 * ```tsx
 * <CheckoutScreen
 *   config={{
 *     currentStep: "shipping",
 *     items: [...],
 *     subtotal: 299,
 *     shipping: 10,
 *     tax: 24,
 *     total: 333,
 *   }}
 * />
 * ```
 */
export function CheckoutScreen({ config, styleOverrides }: CheckoutScreenProps) {
	const { colors, fonts, spacing, mode, shadow, typeStyles } = useTheme();
	const { pagePadding } = useResponsiveTheme();
	const insets = useSafeAreaInsets();
	const { t } = useI18n();

	const {
		currentStep,
		items,
		currency = "$",
		subtotal,
		shipping,
		tax,
		total,
		externalPricing,
		shippingAddress,
		onShippingAddressChange,
		shippingAddressNotice,
		errorMessage,
		paymentMethod,
		paymentStep,
		onPaymentMethodChange,
		onStepChange,
		onPlaceOrder,
		placingOrder,
		continueTestID,
		placeOrderTestID,
		errorTestID,
		placeOrderLabel = t("ecommerce.placeOrder"),
		placingOrderLabel = t("ecommerce.placingOrder"),
		placeOrderAccessibilityLabel = placeOrderLabel,
	} = config;
	const [addressErrors, setAddressErrors] = useState<
		Partial<Record<keyof NonNullable<CheckoutScreenConfig["shippingAddress"]>, string>>
	>({});

	const steps: Array<{ id: CheckoutStep; label: string }> = [
		{ id: "shipping", label: t("ecommerce.shipping") },
		{ id: "payment", label: t("ecommerce.payment") },
		{ id: "review", label: t("ecommerce.review") },
	];

	const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
	const nextStep = steps[Math.min(steps.length - 1, currentStepIndex + 1)]!;
	const address = shippingAddress ?? {
		name: "",
		street: "",
		city: "",
		zip: "",
		country: "",
	};

	const updateAddress = (
		key: keyof NonNullable<CheckoutScreenConfig["shippingAddress"]>,
		value: string,
	) => {
		setAddressErrors((errors) => ({ ...errors, [key]: undefined }));
		onShippingAddressChange?.({
			...address,
			[key]: value,
		});
	};

	const renderAddressInput = ({
		field,
		placeholder,
		testID,
		keyboardType,
		autoComplete,
	}: {
		field: keyof NonNullable<CheckoutScreenConfig["shippingAddress"]>;
		placeholder: string;
		testID: string;
		keyboardType?: TextInputProps["keyboardType"];
		autoComplete?: TextInputProps["autoComplete"];
	}) => {
		const error = addressErrors[field];

		return (
			<View style={staticStyles.addressField}>
				<View
					style={[
						staticStyles.input,
						{
							backgroundColor: colors.surfaceRaised,
							borderColor: error ? colors.danger : colors.border,
						},
					]}
					testID={`${testID}-container`}
				>
					<TextInput
						testID={testID}
						value={address[field]}
						onChangeText={(value) => updateAddress(field, value)}
						placeholder={placeholder}
						placeholderTextColor={colors.textDisabled}
						keyboardType={keyboardType}
						autoComplete={autoComplete}
						autoCapitalize="words"
						returnKeyType="next"
						style={[
							staticStyles.textInput,
							{
								color: colors.text,
								...resolveFontStyle(fonts, typeStyles.body.fontFamily, "regular"),
								fontSize: 16,
							},
						]}
					/>
				</View>
				{error ? (
					<View
						style={[staticStyles.addressError, { backgroundColor: colors.dangerSubtle }]}
						testID={`${testID}-error`}
					>
						<Text variant="caption" colorKey="danger">
							{error}
						</Text>
					</View>
				) : null}
			</View>
		);
	};

	const validateShippingAddress = () => {
		const nextErrors: Partial<
			Record<keyof NonNullable<CheckoutScreenConfig["shippingAddress"]>, string>
		> = {};

		if (!address.name.trim()) nextErrors.name = t("ecommerce.addressNameRequired");
		if (!address.street.trim()) nextErrors.street = t("ecommerce.addressStreetRequired");
		if (!address.city.trim()) nextErrors.city = t("ecommerce.addressCityRequired");
		if (!address.zip.trim()) nextErrors.zip = t("ecommerce.addressZipRequired");
		if (!address.country.trim()) nextErrors.country = t("ecommerce.addressCountryRequired");

		setAddressErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleContinue = () => {
		if (currentStep === "shipping" && !validateShippingAddress()) return;
		onStepChange?.(nextStep.id);
	};

	const handlePlaceOrder = () => {
		if (placingOrder) return;
		onPlaceOrder?.();
	};

	const renderStepIndicator = () => (
		<View style={[staticStyles.stepIndicator, styleOverrides?.stepIndicator]}>
			{steps.map((step, index) => (
				<View key={step.id} style={staticStyles.stepItem}>
					<View
						style={[
							staticStyles.stepNumber,
							{
								backgroundColor:
									index < currentStepIndex
										? colors.text
										: index === currentStepIndex
											? colors.surface
											: colors.surfaceRaised,
								...(index === currentStepIndex && mode === "light" ? shadow.pill : {}),
							},
						]}
					>
						{index < currentStepIndex ? (
							<Icon name="Check" size={16} color={colors.background} />
						) : (
							<Text
								variant="caption"
								color={index === currentStepIndex ? colors.text : colors.textMuted}
							>
								{index + 1}
							</Text>
						)}
					</View>
					<Text variant="label" color={index === currentStepIndex ? colors.text : colors.textMuted}>
						{step.label}
					</Text>

					{index < steps.length - 1 && (
						<View
							style={[
								staticStyles.stepConnector,
								{
									backgroundColor: index < currentStepIndex ? colors.text : colors.border,
								},
							]}
						/>
					)}
				</View>
			))}
		</View>
	);

	const renderShippingForm = () => (
		<Card variant="flat" border="subtle" padding="md" style={staticStyles.contentSection}>
			<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
				{t("ecommerce.shippingAddress")}
			</Text>

			{shippingAddressNotice ? (
				<View
					style={[
						staticStyles.addressNotice,
						{
							backgroundColor: colors.primarySubtle,
							borderColor: colors.primarySubtle,
						},
					]}
					testID="checkout-address-notice"
				>
					<Icon name="CheckCircle2" size={16} color={colors.primary} />
					<Text variant="caption" colorKey="primary">
						{shippingAddressNotice}
					</Text>
				</View>
			) : null}

			<View style={staticStyles.inputRow}>
				{renderAddressInput({
					field: "name",
					placeholder: t("auth.fullName"),
					testID: "checkout-address-name",
					autoComplete: "name",
				})}
			</View>

			<View style={staticStyles.inputRow}>
				{renderAddressInput({
					field: "street",
					placeholder: t("ecommerce.streetAddress"),
					testID: "checkout-address-street",
					autoComplete: "street-address",
				})}
			</View>

			<View style={[staticStyles.inputRow, { flexDirection: "row" }]}>
				{renderAddressInput({
					field: "city",
					placeholder: t("ecommerce.city"),
					testID: "checkout-address-city",
				})}
				{renderAddressInput({
					field: "zip",
					placeholder: t("ecommerce.zipCode"),
					testID: "checkout-address-zip",
					keyboardType: "number-pad",
					autoComplete: "postal-code",
				})}
			</View>

			<View style={staticStyles.inputRow}>
				{renderAddressInput({
					field: "country",
					placeholder: t("ecommerce.country"),
					testID: "checkout-address-country",
					autoComplete: "country",
				})}
			</View>
		</Card>
	);

	const renderPaymentForm = () => (
		<Card variant="flat" border="subtle" padding="lg" style={staticStyles.contentSection}>
			<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
				{t("ecommerce.paymentMethod")}
			</Text>

			{paymentStep?.type === "external" ? (
				<View
					style={[
						staticStyles.externalPayment,
						{
							backgroundColor: colors.surfaceRaised,
						},
					]}
					testID={paymentStep.testID}
				>
					<View
						style={[staticStyles.externalPaymentIcon, { backgroundColor: colors.primarySubtle }]}
					>
						<Icon name={paymentStep.icon ?? "ExternalLink"} size={20} color={colors.primary} />
					</View>
					<View style={{ flex: 1, minWidth: 0, gap: 4 }}>
						<Text variant="body" color={colors.text}>
							{paymentStep.title}
						</Text>
						<Text variant="caption" color={colors.textMuted}>
							{paymentStep.description}
						</Text>
					</View>
				</View>
			) : (
				[
					{
						id: "card",
						label: t("ecommerce.creditCard"),
						icon: "CreditCard",
						brand: "Visa",
						last4: "4242",
					},
					{ id: "paypal", label: t("ecommerce.paypal"), icon: "Wallet" },
					{ id: "apple_pay", label: t("ecommerce.applePay"), icon: "Smartphone" },
				].map((method) => (
					<TouchableOpacity
						key={method.id}
						onPress={() =>
							onPaymentMethodChange?.({
								type: method.id as NonNullable<CheckoutScreenConfig["paymentMethod"]>["type"],
								brand: method.brand,
								last4: method.last4,
							})
						}
						style={[
							staticStyles.paymentMethod,
							{
								backgroundColor:
									paymentMethod?.type === method.id ? colors.surface : colors.surfaceRaised,
								...(paymentMethod?.type === method.id && mode === "light" ? shadow.pill : {}),
							},
						]}
					>
						<Icon name={method.icon as IconName} size={24} color={colors.textMuted} />
						<View style={{ flex: 1, minWidth: 0 }}>
							<Text variant="body" color={colors.text}>
								{method.label}
							</Text>
							{method.brand && method.last4 ? (
								<Text variant="caption" color={colors.textMuted}>
									{method.brand} •••• {method.last4}
								</Text>
							) : null}
						</View>
						{paymentMethod?.type === method.id ? (
							<Icon name="CheckCircle2" size={18} color={colors.primary} />
						) : null}
					</TouchableOpacity>
				))
			)}
		</Card>
	);

	const renderReview = () => (
		<Card variant="flat" border="subtle" padding="lg" style={staticStyles.contentSection}>
			<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
				{t("ecommerce.orderReview")}
			</Text>

			{shippingAddress && (
				<View style={{ marginBottom: 16 }}>
					<Text variant="caption" color={colors.textMuted}>
						{t("ecommerce.shippingTo")}
					</Text>
					<Text variant="body" color={colors.text}>
						{shippingAddress.name}
					</Text>
					<Text variant="body" color={colors.text}>
						{shippingAddress.street}
					</Text>
					<Text variant="body" color={colors.text}>
						{shippingAddress.city}, {shippingAddress.zip}
					</Text>
					<Text variant="body" color={colors.text}>
						{shippingAddress.country}
					</Text>
				</View>
			)}

			{paymentStep?.type === "external" ? (
				<View>
					<Text variant="caption" color={colors.textMuted}>
						{t("ecommerce.paymentMethod")}
					</Text>
					<Text variant="body" color={colors.text}>
						{paymentStep.title}
					</Text>
				</View>
			) : null}

			{!paymentStep && paymentMethod && (
				<View>
					<Text variant="caption" color={colors.textMuted}>
						{t("ecommerce.paymentMethod")}
					</Text>
					<Text variant="body" color={colors.text}>
						{paymentMethod.type === "card"
							? `${paymentMethod.brand} •••• ${paymentMethod.last4}`
							: paymentMethod.type}
					</Text>
				</View>
			)}
		</Card>
	);

	return (
		<Screen style={[staticStyles.container, { paddingBottom: insets.bottom }]}>
			<ScrollView
				style={staticStyles.scrollView}
				contentContainerStyle={[staticStyles.scrollContent, { paddingBottom: spacing["lg"] }]}
				showsVerticalScrollIndicator={false}
			>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					<View style={{ marginTop: spacing["lg"] }}>
						{/* Step Indicator */}
						{renderStepIndicator()}

						{/* Main Content */}
						<View style={styleOverrides?.content}>
							{errorMessage ? (
								<View
									style={[
										staticStyles.checkoutError,
										{
											backgroundColor: colors.dangerSubtle,
											borderColor: colors.dangerSubtle,
										},
									]}
									testID={errorTestID}
									accessibilityRole="alert"
								>
									<Icon name="CircleAlert" size={16} color={colors.danger} />
									<Text variant="caption" colorKey="danger" style={{ flex: 1 }}>
										{errorMessage}
									</Text>
								</View>
							) : null}
							{currentStep === "shipping" && renderShippingForm()}
							{currentStep === "payment" && renderPaymentForm()}
							{currentStep === "review" && renderReview()}
						</View>

						{/* Order Summary */}
						<Card
							variant="flat"
							border="subtle"
							padding="md"
							style={[staticStyles.contentSection, styleOverrides?.summarySection || {}]}
						>
							<Text variant="label" color={colors.textMuted} style={staticStyles.sectionTitle}>
								{t("ecommerce.orderSummary")}
							</Text>

							{/* Items */}
							{items.map((item) => (
								<View key={item.id} style={staticStyles.summaryItem}>
									<Text
										variant="body"
										color={colors.textMuted}
										style={staticStyles.summaryItemName}
										numberOfLines={2}
									>
										{item.name} x{item.quantity}
									</Text>
									<Text variant="body" color={colors.text} style={staticStyles.summaryItemPrice}>
										{currency}
										{(item.price * item.quantity).toFixed(2)}
									</Text>
								</View>
							))}

							{/* Costs */}
							<View style={staticStyles.summaryItem}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.subtotal")}
								</Text>
								<Text variant="body" color={colors.text}>
									{currency}
									{subtotal.toFixed(2)}
								</Text>
							</View>

							<View style={staticStyles.summaryItem}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.shipping")}
								</Text>
								<Text variant="body" color={colors.text}>
									{externalPricing?.label ?? `${currency}${shipping.toFixed(2)}`}
								</Text>
							</View>

							<View style={staticStyles.summaryItem}>
								<Text variant="body" color={colors.textMuted}>
									{t("ecommerce.tax")}
								</Text>
								<Text variant="body" color={colors.text}>
									{externalPricing?.label ?? `${currency}${tax.toFixed(2)}`}
								</Text>
							</View>

							{/* Total */}
							<View style={[staticStyles.totalRow, { borderTopColor: colors.border }]}>
								<Text variant="body" color={colors.textMuted} transform="uppercase">
									{externalPricing ? t("ecommerce.subtotal") : t("ecommerce.total")}
								</Text>
								<Text
									variant="heading"
									color={colors.text}
									style={staticStyles.totalAmount}
									numberOfLines={1}
									adjustsFontSizeToFit
									minimumFontScale={0.72}
								>
									{currency}
									{(externalPricing ? subtotal : total).toFixed(2)}
								</Text>
							</View>
							{externalPricing?.notice ? (
								<Text variant="caption" color={colors.textMuted}>
									{externalPricing.notice}
								</Text>
							) : null}
						</Card>

						<View style={{ height: spacing["4xl"] }} />
					</View>
				</ResponsiveContainer>
			</ScrollView>
			<View style={[staticStyles.stickyActions, { marginBottom: insets.bottom + 12 }]}>
				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 720, lg: 960 }}
					horizontalPadding={pagePadding}
				>
					<Card
						variant="raised"
						border="subtle"
						padding="sm"
						style={staticStyles.stickyActionsBackground}
					>
						<View style={staticStyles.actionsContainer}>
							{currentStep !== "shipping" && (
								<Button
									onPress={() => onStepChange?.(steps[Math.max(0, currentStepIndex - 1)]!.id)}
									accessibilityLabel={t("common.back")}
									variant="secondary"
									style={staticStyles.footerButton}
								>
									{t("common.back")}
								</Button>
							)}

							{currentStep !== "review" ? (
								<Button
									testID={continueTestID ? `${continueTestID}-${currentStep}` : undefined}
									onPress={handleContinue}
									accessibilityLabel={t("ecommerce.continueToStep", {
										step: nextStep.label.toLowerCase(),
									})}
									variant="primary"
									style={{
										...staticStyles.footerButton,
										...staticStyles.footerPrimaryButton,
									}}
								>
									{t("common.continue")}
								</Button>
							) : (
								<Button
									onPress={handlePlaceOrder}
									disabled={placingOrder}
									testID={placeOrderTestID}
									accessibilityLabel={placeOrderAccessibilityLabel}
									variant="primary"
									style={{
										...staticStyles.footerButton,
										...staticStyles.footerPrimaryButton,
									}}
								>
									{placingOrder ? placingOrderLabel : placeOrderLabel}
								</Button>
							)}
						</View>
					</Card>
				</ResponsiveContainer>
			</View>
		</Screen>
	);
}
