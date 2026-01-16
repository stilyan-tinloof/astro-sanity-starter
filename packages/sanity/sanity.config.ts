import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./src/schema";

console.debug("Sanity Project ID:", process.env["SANITY_STUDIO_PROJECT_ID"]);

export default defineConfig({
  name: "default",
  title: "Brandyour CF",
  projectId: process.env["SANITY_STUDIO_PROJECT_ID"] || "rpxvvkoy",
  dataset: process.env["SANITY_STUDIO_DATASET"] || "migration",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
