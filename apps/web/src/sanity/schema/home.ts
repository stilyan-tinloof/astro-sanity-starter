import { defineArrayMember, defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";
import { definePathname } from "@tinloof/sanity-studio";

export const home = defineType({
	name: "home",
	title: "Home Page",
	type: "document",
	icon: HomeIcon,
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
