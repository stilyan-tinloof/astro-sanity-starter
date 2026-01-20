import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./src/schema";

export default defineConfig({
  name: "default",
  title: "Brandyour CF",
  projectId: "rpxvvkoy",
  dataset: "migration",
  plugins: [structureTool(), visionTool()],
  basePath: "/cms",
  schema: {
    types: schemaTypes,
  },
});
