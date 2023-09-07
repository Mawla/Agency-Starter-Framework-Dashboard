import { sFetch, vFetch } from "@/lib/queries/fetch";
import { sanityServerClient } from "@/lib/sanity.server";
import { slugify } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import { NextApiResponse } from "next";
import { groq } from "next-sanity";
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
  const projectName = slugify(params.projectName);

  if (!projectName) {
    return NextResponse.json({
      ok: 0,
    });
  }

  // create new project
  const { _id: projectId } = await sanityServerClient.create({
    _type: "project",
    title: projectName,
    slug: {
      current: slugify(projectName),
    },
    log: ["Created project from API"],
  });

  /* Mirror logs to sanity */
  async function log(msg: string) {
    if (!msg) return;
    let str = msg.toString();
    if (!str.trim().length) return;
    str = str.replace("[0;36m", "").replace("[0m", "");

    console.log(str);

    sanityServerClient
      .patch(projectId)
      .insert("after", "log[-1]", [str])
      .commit();
  }

  // get sanity user id
  const sanityUserId = await sanityServerClient.fetch(
    groq`*[_type == 'user' && clerk.id == $userId][0]._id`,
    { userId },
  );

  // add project to user
  sanityServerClient
    .patch(sanityUserId)
    .setIfMissing({ projects: [] })
    .insert("after", "projects[-1]", [
      { _type: "reference", _ref: projectId, _weak: true },
    ])
    .commit({
      autoGenerateArrayKeys: true,
    });

  log(`Added project to user ${sanityUserId}`);

  let q: any;
  let obj: any;

  /**
   * Create Sanity project
   */
  console.log("Creating Sanity project");

  obj = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects`,

    {
      displayName: projectName,
      organizationId: process.env.ADMIN_SANITY_ORGANISATION_ID,
    },
  );
  const SANITY_PROJECT_ID = obj.id;

  sanityServerClient
    .patch(projectId)
    .set({ "sanity.id": SANITY_PROJECT_ID })
    .commit();

  /**
   * Create Sanity dataset
   */
  console.log("Creating Sanity dataset");

  const SANITY_DATASET = "production";
  obj = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/datasets/${SANITY_DATASET}`,
    undefined,
    "PUT",
  );

  /**
   * Create random tokens
   */
  console.log("Creating random tokens");

  q = await fetch(`https://random-word-api.herokuapp.com/word?number=4`, {
    headers: { "Content-Type": "application/json" },
  });
  obj = await q.json();
  const SANITY_PREVIEW_SECRET = obj.join("_");

  q = await fetch(`https://random-word-api.herokuapp.com/word?number=4`, {
    headers: { "Content-Type": "application/json" },
  });
  obj = await q.json();
  const SANITY_WEBHOOK_SECRET = obj.join("_");

  /**
   * Create Sanity WRITE token
   */
  console.log("Creating Sanity WRITE token");

  obj = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/tokens`,

    { label: "preview-write", roleName: "editor" },
  );
  const SANITY_API_WRITE_TOKEN = obj.key;

  /**
   * Create Sanity READ token
   */

  console.log("Creating Sanity READ token");

  obj = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/tokens`,

    { label: "preview-read", roleName: "viewer" },
  );
  const SANITY_API_READ_TOKEN = obj.key;

  /**
   * Create Sanity CORS origins
   */

  console.log("Creating CORS origins");

  await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/cors`,

    {
      origin: "http://localhost:3333",
      allowCredentials: true,
    },
  );

  await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/cors`,

    {
      origin: "http://localhost:3000",
      allowCredentials: true,
    },
  );

  await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/cors`,
    {
      origin: `https://${projectName}.vercel.app`,
      allowCredentials: true,
    },
  );

  console.log(SANITY_PROJECT_ID);
  console.log(SANITY_DATASET);
  console.log(SANITY_PREVIEW_SECRET);
  console.log(SANITY_WEBHOOK_SECRET);
  console.log(SANITY_API_WRITE_TOKEN);
  console.log(SANITY_API_READ_TOKEN);

  /**
   * Create Vercel project
   */
  const environmentVariables = [
    { key: "SANITY_API_WRITE_TOKEN", value: SANITY_API_WRITE_TOKEN },
    { key: "SANITY_API_READ_TOKEN", value: SANITY_API_READ_TOKEN },
    { key: "SANITY_WEBHOOK_SECRET", value: SANITY_WEBHOOK_SECRET },
    { key: "SANITY_PREVIEW_SECRET", value: SANITY_PREVIEW_SECRET },
    { key: "SANITY_STUDIO_PROJECT_PATH", value: "/" },
    { key: "SANITY_STUDIO_API_DATASET", value: SANITY_DATASET },
    { key: "NEXT_PUBLIC_SANITY_DATASET", value: SANITY_DATASET },
    { key: "SANITY_STUDIO_API_PROJECT_ID", value: SANITY_PROJECT_ID },
    { key: "NEXT_PUBLIC_SANITY_PROJECT_ID", value: SANITY_PROJECT_ID },
  ];

  console.log("Creating Vercel project");

  const vercelResult = await vFetch(`https://api.vercel.com/v9/projects`, {
    name: projectName,
    commandForIgnoringBuildStep:
      'if [ "$VERCEL_ENV" == "production" ]; then exit 1; else exit 0; fi',
    environmentVariables: environmentVariables.map(({ key, value }) => ({
      key,
      value,
      target: "production",
      type: "encrypted",
    })),
    framework: "nextjs",
    gitRepository: {
      repo: `${process.env.ADMIN_GITHUB_REPO}`,
      type: "github",
    },
    serverlessFunctionRegion: "dub1",
  });

  const VERCEL_PROJECT_ID = vercelResult.id;

  console.log(vercelResult);

  sanityServerClient
    .patch(projectId)
    .set({ "vercel.id": VERCEL_PROJECT_ID })
    .commit();

  /**
   * Deploy Vercel
   */

  console.log("Creating Vercel deploy hook");

  await vFetch(
    `https://vercel.com/api/v2/projects/${VERCEL_PROJECT_ID}/deploy-hooks`,
    { name: "redeploy", ref: "main" },
  );

  console.log("Fetching Vercel project data");

  const vercelProject = await vFetch(
    `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}`,
    undefined,
    "GET",
  );

  console.log("Updating Sanity project with Vercel deploy hook");

  const VERCEL_REDEPLOY_HOOK = vercelProject.link.deployHooks[0].url;
  sanityServerClient
    .patch(projectId)
    .set({ "vercel.deploy_hook": VERCEL_REDEPLOY_HOOK })
    .commit();

  console.log("Deploying Vercel project with hook");

  await fetch(VERCEL_REDEPLOY_HOOK);

  console.log("Done");

  return NextResponse.json({
    ok: 1,
  });
}
