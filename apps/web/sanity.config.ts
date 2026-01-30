import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { pages } from "@tinloof/sanity-studio";
import {
	defineLocations,
	type DocumentLocationResolvers,
} from "sanity/presentation";

import { schemaTypes } from "./src/sanity/schema";

// Resolve document locations for presentation tool navigation
const locations: DocumentLocationResolvers = {
	home: defineLocations({
		select: { pathname: "pathname.current" },
		resolve: (doc) => ({
			locations: [{ title: "Home", href: doc?.pathname || "/" }],
		}),
	}),
	page: defineLocations({
		select: { pathname: "pathname.current" },
		resolve: (doc) => ({
			locations: doc?.pathname
				? [{ title: doc.pathname, href: doc.pathname }]
				: [],
		}),
	}),
};

export default defineConfig({
	name: "default",
	title: "Brandyour CF",
	projectId: "fl1nk1cy",
	dataset: "production",
	plugins: [
		structureTool(),
		visionTool(),
		pages({
			abstracts: { page: false },
			previewUrl: {
				draftMode: {
					enable: "/api/draft-mode/enable",
				},
			},
			resolve: { locations },
		}),
	],
	schema: {
		types: schemaTypes,
	},
});
