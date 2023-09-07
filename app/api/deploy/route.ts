import { vFetch } from "@/lib/queries/fetch";
import { getDeployHook } from "@/lib/queries/get-project";
import { sanityServerClient } from "@/lib/sanity.server";
import { auth } from "@clerk/nextjs";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function POST(_req: Request, res: NextApiResponse) {
  const { userId }: { userId: string | null } = auth();

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const params = await _req.json();
  const projectName = params.project;

  if (!projectName) {
    return NextResponse.json({
      ok: 0,
    });
  }

  const deployHook = await getDeployHook(projectName);
  if (!deployHook) {
    return NextResponse.json({
      ok: 0,
    });
  }
  await fetch(deployHook);

  return NextResponse.json({
    ok: 1,
  });
}
