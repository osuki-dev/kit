import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	Screen,
	Text,
	Button,
	SegmentedControl,
	useTheme,
	useResponsiveTheme,
	ResponsiveContainer,
} from "@osuki-dev/ui";

export interface OnboardingStep {
	id: string;
	title: string;
	description: string;
	/** Optional icon/component for the step */
	visual?: React.ReactNode;
	/** Accent color for this step (hex) */
	accentColor?: string;
}

export interface OnboardingScreenProps {
	/** Onboarding steps */
	steps: OnboardingStep[];
	/** Current step index */
	currentStep?: number;
	/** On step change */
	onStepChange?: (index: number) => void;
	/** On complete */
	onComplete: () => void;
	/** On skip */
	onSkip?: () => void;
	/** Primary CTA text */
	primaryButtonText?: string;
	/** Skip button text */
	skipButtonText?: string;
	/** Show skip button */
	showSkip?: boolean;
	/** Show progress dots */
	showDots?: boolean;
	/** Show step counter (e.g., "1/3") */
	showCounter?: boolean;
}

/**
 * Onboarding screen template
 *
 * Features:
 * - Multi-step onboarding flow
 * - Progress dots indicator
 * - Swipeable steps (optional)
 * - Skip option
 * - Customizable visuals per step
 *
 * @example
 * ```tsx
 * <OnboardingScreen
 *   steps={[
 *     {
 *       id: 'welcome',
 *       title: 'WELCOME',
 *       description: 'Get started with our app',
 *       accentColor: '#D71921',
 *     },
 *     {
 *       id: 'features',
 *       title: 'FEATURES',
 *       description: 'Discover what we offer',
 *     },
 *     {
 *       id: 'ready',
 *       title: 'READY',
 *       description: 'Let\'s begin!',
 *     },
 *   ]}
 *   onComplete={() => navigate('home')}
 * />
 * ```
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
	steps,
	currentStep: controlledStep,
	onStepChange,
	onComplete,
	onSkip,
	primaryButtonText = "NEXT",
	skipButtonText = "SKIP",
	showSkip = true,
	showDots = true,
	showCounter = true,
}) => {
	const insets = useSafeAreaInsets();
	const { colors, spacing } = useTheme();
	const { pagePadding } = useResponsiveTheme();

	const [internalStep, setInternalStep] = useState(0);
	const currentStep = controlledStep ?? internalStep;
	const currentStepData = steps[currentStep] || steps[0];

	// Guard against empty steps array
	if (!currentStepData) {
		return (
			<Screen>
				<View style={[styles.loadingContainer, { paddingTop: spacing["4xl"] }]}>
					<Text variant="caption" color={colors.textMuted}>
						[NO STEPS]
					</Text>
				</View>
			</Screen>
		);
	}

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			const nextStep = currentStep + 1;
			if (controlledStep === undefined) {
				setInternalStep(nextStep);
			}
			onStepChange?.(nextStep);
		} else {
			onComplete();
		}
	};

	const handleSkip = () => {
		onSkip?.();
	};

	const handleStepSelect = (index: number) => {
		if (controlledStep === undefined) {
			setInternalStep(index);
		}
		onStepChange?.(index);
	};

	return (
		<Screen>
			<View style={[styles.container, { paddingTop: insets.top }]}>
				{/* Skip Button */}
				{showSkip && onSkip && currentStep < steps.length - 1 && (
					<TouchableOpacity
						onPress={handleSkip}
						style={[styles.skipButton, { paddingTop: spacing["md"], paddingRight: pagePadding }]}
					>
						<Text variant="caption" color={colors.textMuted}>
							{skipButtonText}
						</Text>
					</TouchableOpacity>
				)}

				<ResponsiveContainer
					maxWidth={{ xs: "100%", md: 480, lg: 560 }}
					horizontalPadding={pagePadding}
					alignment="center"
				>
					{/* Content Area */}
					<View style={[styles.content, { paddingTop: spacing["4xl"] }]}>
						{/* Visual */}
						{currentStepData.visual ? (
							<View style={styles.visualContainer}>{currentStepData.visual}</View>
						) : (
							<View
								style={[
									styles.defaultVisual,
									{
										backgroundColor: currentStepData.accentColor || colors.surfaceRaised,
										borderColor: colors.border,
									},
								]}
							>
								<Text variant="hero" color={colors.text} style={{ fontSize: 64 }}>
									{currentStep + 1}
								</Text>
							</View>
						)}

						{/* Title */}
						<Text
							variant="heading"
							color={colors.text}
							style={[styles.title, { marginTop: spacing["xl"] }]}
						>
							{currentStepData.title}
						</Text>

						{/* Description */}
						<Text
							variant="body"
							color={colors.textMuted}
							style={[styles.description, { marginTop: spacing["md"] }]}
						>
							{currentStepData.description}
						</Text>
					</View>

					{/* Bottom Section */}
					<View style={[styles.bottom, { paddingBottom: insets.bottom + spacing["xl"] }]}>
						{/* Step Counter */}
						{showCounter && (
							<Text
								variant="caption"
								color={colors.textDisabled}
								style={{ marginBottom: spacing["md"] }}
							>
								{currentStep + 1}/{steps.length}
							</Text>
						)}

						{/* Progress Dots */}
						{showDots && (
							<View style={[styles.dotsContainer, { marginBottom: spacing["lg"] }]}>
								{steps.map((_, index) => (
									<TouchableOpacity
										key={index}
										onPress={() => handleStepSelect(index)}
										style={[
											styles.dot,
											{
												backgroundColor: index === currentStep ? colors.text : colors.border,
												width: index === currentStep ? 24 : 8,
											},
										]}
									/>
								))}
							</View>
						)}

						{/* Progress Segmented Control (for many steps) */}
						{steps.length > 4 && (
							<View style={{ marginBottom: spacing["lg"], width: "100%" }}>
								<SegmentedControl
									options={steps.map((_step, index) => ({
										label: String(index + 1),
										value: String(index),
									}))}
									value={String(currentStep)}
									onChange={(value) => handleStepSelect(parseInt(value, 10))}
								/>
							</View>
						)}

						{/* Primary Button */}
						<Button variant="primary" onPress={handleNext} style={{ width: "100%" }}>
							{currentStep === steps.length - 1 ? "GET STARTED" : primaryButtonText}
						</Button>

						{/* Secondary: Go Back (if not first step) */}
						{currentStep > 0 && (
							<TouchableOpacity
								onPress={() => handleStepSelect(currentStep - 1)}
								style={{ marginTop: spacing["md"] }}
							>
								<Text variant="caption" color={colors.textMuted}>
									BACK
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</ResponsiveContainer>
			</View>
		</Screen>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		alignItems: "center",
	},
	skipButton: {
		alignSelf: "flex-end",
		padding: 8,
	},
	content: {
		flex: 1,
		alignItems: "center",
	},
	visualContainer: {
		marginBottom: 32,
	},
	defaultVisual: {
		width: 160,
		height: 160,
		borderRadius: 80,
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		textAlign: "center",
	},
	description: {
		textAlign: "center",
		maxWidth: 280,
	},
	bottom: {
		alignItems: "center",
		paddingTop: 32,
	},
	dotsContainer: {
		flexDirection: "row",
		gap: 8,
	},
	dot: {
		height: 8,
		borderRadius: 4,
	},
});
