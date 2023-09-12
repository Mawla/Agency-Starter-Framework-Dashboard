import { defineField, defineType } from "sanity";

export default defineType({
  name: "user",
  type: "document",
  title: "User",
  preview: {
    select: {
      firstname: "clerk.first_name",
      lastname: "clerk.last_name",
    },
    prepare({ firstname, lastname }) {
      return {
        title: `${firstname} ${lastname}`,
      };
    },
  },
  fields: [
    defineField({
      name: "clerk",
      type: "object",
      title: "Clerk",
      readOnly: false,
      fields: [
        defineField({
          name: "id",
          type: "string",
        }),
        defineField({
          name: "first_name",
          type: "string",
        }),
        defineField({
          name: "last_name",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "projects",
      type: "array",
      of: [{ type: "reference", weak: true, to: { type: "project" } }],
    }),
  ],
});
