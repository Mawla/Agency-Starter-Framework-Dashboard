"server-only";

import { sFetch } from "@/lib/queries/fetch";
import { auth } from "@clerk/nextjs/server";
import { NextApiResponse } from "next";

import { NextResponse } from "next/server";
import { getProjectIds } from "@/lib/queries/get-project";

/**
 * This function removes a dataset, creates a new one and imports from a template
 *
 * Alternatively we might add an export endpoint to all projects and then import from that
 * but I'm not sure that's a very secure option.
 * This would allow us to use `sanity dataset import` and `sanity dataset export` within
 * the project context though, that would make things easier.
 *
 * However I prefer having all admin logic in this project if possible.
 */

// qdtcnn4r
export async function POST(_req: Request, res: NextApiResponse) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const params = await _req.json();
  const project = params.project;
  const templateId = params.templateId;
  const { sanityId } = await getProjectIds(project);

  if (!project || !templateId || !sanityId) {
    return NextResponse.json({
      ok: 0,
    });
  }

  // create clean dataset
  console.log("deleting dataset");
  const SANITY_DATASET = "production";
  await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${sanityId}/datasets/${SANITY_DATASET}`,
    undefined,
    "DELETE",
  );

  console.log("creating dataset");
  await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${sanityId}/datasets/${SANITY_DATASET}`,
    undefined,
    "PUT",
  );

  // import template dataset
  console.log("fetching template dataset");
  const templateData = await sFetch(
    `https://${templateId}.api.sanity.io/v2023-09-14/data/query/production?query=*`,
    undefined,
    "GET",
  );
  console.log(`got ${templateData.result.length} documents`);
  console.log("importing template dataset");

  const mutations = templateData.result
    .filter(({ _id }: any) => !_id.startsWith("_."))
    .map((doc: any) => ({
      create: doc,
    }));

  const importAction = await sFetch(
    `https://${sanityId}.api.sanity.io/v2023-09-14/data/mutate/production`,
    { mutations },
    "POST",
  );

  console.log(importAction);
  console.log(importAction?.error?.items);

  return NextResponse.json({
    ok: 1,
  });
}

// This doesn't work, throws a stream error
// await exportDataset({
//   client: sanityProjectServerClient,
//   dataset: "production",
//   outputPath: `/tmp/${sanityProjectId}.tar.gz`, // Path to write tar.gz-archive file to, or `-` for stdout
//   assets: true, // Whether or not to export assets. Note that this operation is currently slightly lossy; metadata stored on the asset document itself (original filename, for instance) might be lost
//   raw: false, // Exports documents only, without downloading or rewriting asset references
//   drafts: true,
//   assetConcurrency: 12,
//   onProgress: () => null,
// });
