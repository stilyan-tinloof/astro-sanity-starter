import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env["PUBLIC_SANITY_PROJECT_ID"] || "fl1nk1cy",
    dataset: process.env["PUBLIC_SANITY_DATASET"] || "production",
  },
  project: {
    basePath: "/cms",
  },
  typegen: {
    generates: "./sanity.types.ts",
    overloadClientMethods: true,
  },
});
