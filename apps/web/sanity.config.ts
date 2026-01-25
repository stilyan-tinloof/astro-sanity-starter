import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./src/sanity/schema";

export default defineConfig({
	name: "default",
	title: "Brandyour CF",
	projectId: "fl1nk1cy",
	dataset: "production",
	plugins: [structureTool(), visionTool()],
	schema: {
		types: schemaTypes,
	},
});
