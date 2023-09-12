import { getProjectStatus } from "@/lib/queries/project";
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

  const status = await getProjectStatus(projectName);

  return NextResponse.json({
    status,
  });
}
