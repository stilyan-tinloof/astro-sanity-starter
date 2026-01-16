// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  env: {
    schema: {
      SANITY_PROJECT_ID: envField.string({
        access: "public",
        context: "client",
      }),
      SANITY_DATASET: envField.string({ access: "public", context: "client" }),
      SANITY_API_VERSION: envField.string({
        access: "public",
        default: "2026-01-16",
        context: "client",
      }),
      SANITY_TOKEN: envField.string({ access: "public", context: "server" }),
    },
  },

  integrations: [react()],
  adapter: cloudflare(),
});
