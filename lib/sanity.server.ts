"server-only";

import { createClient } from "next-sanity";

export const sanityServerClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  useCdn: false,
  apiVersion: "2023-05-03",
  token: process.env.SANITY_WRITE_TOKEN as string,
});
