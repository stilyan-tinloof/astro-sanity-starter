import { createClient } from "@sanity/client";

// Import types to activate module augmentation for automatic type inference
import "../../sanity.types";

const SANITY_API_VERSION = "2026-01-16";

export const sanityClient = createClient({
	projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: import.meta.env.PUBLIC_SANITY_DATASET,
	apiVersion: SANITY_API_VERSION,
	token: import.meta.env.SANITY_TOKEN,
	useCdn: false,
});

// Browser-safe client: no token, PUBLIC_ env vars only.
// Used client-side for live.events() EventSource subscription.
export const liveSanityClient = createClient({
	projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: import.meta.env.PUBLIC_SANITY_DATASET,
	apiVersion: SANITY_API_VERSION,
	useCdn: true,
});
