import { vFetch } from "@/lib/queries/fetch";
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

  const deployment = await vFetch(
    `https://api.vercel.com/v13/deployments?teamId=${process.env.ADMIN_VERCEL_TEAM_ID}`,
    {
      gitSource: {
        ref: "main",
        repo: process.env.ADMIN_GITHUB_REPO?.split("/")[1],
        repoId: process.env.ADMIN_GITHUB_REPO_ID,
        org: process.env.ADMIN_GITHUB_REPO?.split("/")[0],
        type: "github",
      },
      name: projectName,
      projectSettings: {
        buildCommand: null,
        devCommand: null,
        framework: "nextjs",
        commandForIgnoringBuildStep: "",
        installCommand: null,
        outputDirectory: null,
      },
    },
  );

  console.log(deployment);

  return NextResponse.json({
    ok: 1,
  });
}
