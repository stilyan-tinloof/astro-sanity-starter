import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env["SANITY_STUDIO_PROJECT_ID"] || "rpxvvkoy",
    dataset: process.env["SANITY_STUDIO_DATASET"] || "migration",
  },
  project: {
    basePath: "/cms",
  },
  typegen: {
    generates: "./sanity.types.ts",
    overloadClientMethods: true,
  },
});
