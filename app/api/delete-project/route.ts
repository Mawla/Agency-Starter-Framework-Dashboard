import { sFetch, vFetch } from "@/lib/queries/fetch";
import { getProjectIds } from "@/lib/queries/get-project";
import { sanityServerClient } from "@/lib/sanity.server";
import { auth } from "@clerk/nextjs";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

/**
 * Useful links
 * - https://www.sanity.io/docs/http-mutations#0355c7dc93d2
 * - https://vercel.com/docs/rest-api/endpoints#projects
 */

export async function POST(_req: Request, res: NextApiResponse) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const params = await _req.json();
  const project = params.project;

  if (!project) {
    return NextResponse.json({
      ok: 0,
    });
  }

  // create new project
  const data = await getProjectIds(project);

  // delete from Sanity
  await sanityServerClient.delete(data._id);

  // delete sanity project
  if (data.sanityId)
    await sFetch(
      `https://api.sanity.io/v2021-06-07/projects/${data.sanityId}`,
      undefined,
      "DELETE",
    );

  // delete vercel project
  if (data.vercelId)
    await vFetch(
      `https://api.vercel.com/v9/projects/${data.vercelId}`,
      undefined,
      "DELETE",
    );

  return NextResponse.json({
    ok: 1,
  });
}
