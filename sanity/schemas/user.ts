import { defineField, defineType } from "sanity";

export default defineType({
  name: "user",
  type: "document",
  title: "User",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
    }),
    defineField({
      name: "clerk",
      type: "object",
      title: "Clerk",
      readOnly: true,
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
      of: [{ type: "reference", to: { type: "project" } }],
    }),
  ],
});
