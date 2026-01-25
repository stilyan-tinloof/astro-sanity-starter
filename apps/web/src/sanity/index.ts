import { createClient } from "@sanity/client";

// Import types to activate module augmentation for automatic type inference
import "../../sanity.types";

export function getClient(env: Env) {
  const client = createClient({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET,
    apiVersion: "2026-01-16",
    token: env.SANITY_TOKEN,
    useCdn: true,
  });

  return client;
}
