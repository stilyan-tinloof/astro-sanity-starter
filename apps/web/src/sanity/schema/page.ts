import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons";
import { definePathname } from "@tinloof/sanity-studio";

export const page = defineType({
	name: "page",
	title: "Page",
	type: "document",
	icon: DocumentIcon,
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		definePathname(),
		defineField({
			name: "content",
			title: "Content",
			type: "array",
			of: [defineArrayMember({ type: "block" })],
		}),
	],
});
