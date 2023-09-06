import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  type: "document",
  title: "Project",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "vercel",
      type: "object",
      title: "Vercel",
      fields: [
        defineField({
          name: "id",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "sanity",
      type: "object",
      title: "Sanity",
      fields: [
        defineField({
          name: "id",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "log",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
