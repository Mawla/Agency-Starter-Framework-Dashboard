import { type SchemaTypeDefinition } from "sanity";
import user from "./schemas/user";
import project from "./schemas/project";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, project],
};
