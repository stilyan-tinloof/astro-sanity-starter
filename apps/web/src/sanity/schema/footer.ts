import { defineArrayMember, defineField, defineType } from "sanity";
import { BlockContentIcon } from "@sanity/icons";

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: "copyright",
      title: "Copyright Text",
      type: "string",
    }),
    defineField({
      name: "navigation",
      title: "Footer Navigation",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerNavItem",
          title: "Footer Link",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: "Internal link (e.g. /about) or external link (e.g. https://example.com)",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
  ],
});
