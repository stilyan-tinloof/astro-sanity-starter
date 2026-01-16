import { createClient } from "@sanity/client";
import config from "@/config";

// Import types to activate module augmentation for automatic type inference
import '@packages/sanity/types';

export const sanityClient = createClient({
  projectId: config.sanity.projectId,
  dataset: config.sanity.dataset,
  apiVersion: config.sanity.apiVersion,
  token: config.sanity.token,
  useCdn: false,
});