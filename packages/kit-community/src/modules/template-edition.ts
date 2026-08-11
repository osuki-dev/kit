export type TemplateEdition = "community" | "pro" | "internal";

export type TemplateIntegrationMode = "local" | "production" | "internal";

export type TemplateDistributionKind = "source-archive" | "commerce-artifact" | "internal-preview";

export type TemplateDistributionAccess = "public" | "entitled" | "internal";

export interface TemplateIdentity {
	familyId: string;
	templateId: string;
	edition: TemplateEdition;
	version: string;
	docsEntryId: string;
}

export interface TemplateIntegration {
	id: string;
	mode: TemplateIntegrationMode;
	required: boolean;
}

export interface TemplateDistribution {
	kind: TemplateDistributionKind;
	access: TemplateDistributionAccess;
}

export interface TemplateArtifactIdentity {
	id: string;
	format: "tgz";
	manifestPath: string;
}

export interface TemplateEditionMetadata {
	identity: TemplateIdentity;
	integrations: TemplateIntegration[];
	distribution: TemplateDistribution;
	artifact: TemplateArtifactIdentity;
}

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function requireStableId(label: string, value: string, errors: string[]) {
	if (!stableIdPattern.test(value)) errors.push(`${label} must be a stable kebab-case id`);
}

export function validateTemplateEditionMetadata(metadata: TemplateEditionMetadata): string[] {
	const errors: string[] = [];
	requireStableId("identity.familyId", metadata.identity.familyId, errors);
	requireStableId("identity.templateId", metadata.identity.templateId, errors);
	requireStableId("artifact.id", metadata.artifact.id, errors);
	if (!versionPattern.test(metadata.identity.version)) {
		errors.push("identity.version must be a semantic version");
	}
	if (!metadata.identity.docsEntryId.trim()) errors.push("identity.docsEntryId is required");
	if (!metadata.artifact.manifestPath.trim()) errors.push("artifact.manifestPath is required");

	const integrationIds = new Set<string>();
	for (const integration of metadata.integrations) {
		requireStableId("integration.id", integration.id, errors);
		if (integrationIds.has(integration.id)) {
			errors.push(`integration.id must be unique: ${integration.id}`);
		}
		integrationIds.add(integration.id);
	}

	const expectedDistribution: Record<
		TemplateEdition,
		{ kind: TemplateDistributionKind; access: TemplateDistributionAccess }
	> = {
		community: { kind: "source-archive", access: "public" },
		pro: { kind: "commerce-artifact", access: "entitled" },
		internal: { kind: "internal-preview", access: "internal" },
	};
	const expected = expectedDistribution[metadata.identity.edition];
	if (metadata.distribution.kind !== expected.kind) {
		errors.push(`${metadata.identity.edition} edition must use ${expected.kind} distribution`);
	}
	if (metadata.distribution.access !== expected.access) {
		errors.push(`${metadata.identity.edition} edition must use ${expected.access} access`);
	}
	if (
		metadata.identity.edition === "community" &&
		metadata.integrations.some((integration) => integration.mode === "production")
	) {
		errors.push("community edition cannot require production integrations");
	}

	return errors;
}

export function assertTemplateEditionMetadata(metadata: TemplateEditionMetadata): void {
	const errors = validateTemplateEditionMetadata(metadata);
	if (errors.length > 0) throw new Error(errors.join("; "));
}
