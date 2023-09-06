import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  type: "document",
  title: "Project",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
    }),
    defineField({
      name: "slug",
      type: "string",
      title: "Slug",
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
  ],
});
