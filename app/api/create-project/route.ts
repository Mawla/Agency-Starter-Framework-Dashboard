import { sFetch, vFetch } from "@/lib/queries/fetch";
import { sanityServerClient } from "@/lib/sanity.server";
import { slugify } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import { NextApiResponse } from "next";
import { groq } from "next-sanity";
import { NextResponse } from "next/server";
import PQueue from "p-queue";
const nodeFetch = require("node-fetch");
import { nanoid } from "nanoid";

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
  const colors = params.colors;
  const dataset = params.dataset;

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
  log("Creating Sanity project");

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
  log("Creating Sanity dataset");

  const SANITY_DATASET = "production";
  obj = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/datasets/${SANITY_DATASET}`,
    undefined,
    "PUT",
  );

  /**
   * Export template dataset and import into new dataset
   */

  if (dataset !== "empty") {
    log(`Importing dataset ${dataset}`);

    const queue = new PQueue({
      concurrency: 10,
      interval: 1000 / 25,
    });

    const assetConversionMap: Record<string, any> = {};

    /**
     * Download original asset and upload to new project
     * keeping a list of ids to update references in documents
     */

    async function downloadUpload(sanityId: string, doc: any) {
      console.log(`downloading ${doc.originalFilename}`);
      const image = await nodeFetch(doc.url);
      const imageBuffer = await image.buffer();

      console.log(`uploading ${doc.originalFilename}`);
      const result = await sFetch(
        `https://${sanityId}.api.sanity.io/v2021-03-25/assets/images/production`,
        imageBuffer,
        "POST",
        doc.mimeType || "image/jpeg",
        true,
      );
      console.log(result.document._id);

      assetConversionMap[doc._id] = result.document;
    }

    // import template dataset
    console.log("fetching template dataset");
    const templateData = await sFetch(
      `https://${dataset}.api.sanity.io/v2023-09-14/data/query/production?query=*`,
      undefined,
      "GET",
    );
    console.log(`Got ${templateData.result.length} documents`);
    console.log("Starting asset download/upload");

    templateData.result
      .filter(
        ({ _type }: any) =>
          _type === "sanity.imageAsset" || _type === "sanity.fileAsset",
      )
      .map((doc: any) => {
        queue.add(() => downloadUpload(SANITY_PROJECT_ID, doc));
      });

    await queue.onIdle();
    log("Asset download/upload queue is idle, starting mutation import");

    log(JSON.stringify(assetConversionMap));

    const mutations = templateData.result
      // filter out system documents
      .filter(({ _id }: any) => !_id.startsWith("_."))

      // filter out assets
      .filter(
        ({ _type }: any) =>
          _type !== "sanity.imageAsset" && _type !== "sanity.fileAsset",
      )

      // create mutation
      .map((doc: any) => {
        return {
          create: doc,
        };
      });

    let mutationsString = JSON.stringify(mutations);
    Object.entries(assetConversionMap).forEach(([oldId, uploadAssetDoc]) => {
      mutationsString = mutationsString.replaceAll(oldId, uploadAssetDoc._id);
    });

    const importAction = await sFetch(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
      { mutations: JSON.parse(mutationsString) },
      "POST",
    );

    log(importAction);
    if (importAction?.error) log(importAction?.error?.items);
    log("Done importing dataset");
  }

  /**
   * Import color palette
   */

  if (colors) {
    log(`Importing color palette ${colors}`);

    // create theme document if it doesn't exist
    await sFetch(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
      {
        mutations: [
          {
            createIfNotExists: {
              _id: "config_theme",
              _type: "config.theme",
            },
          },
        ],
      },
      "POST",
    );

    // import colors
    await sFetch(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
      {
        mutations: [
          {
            patch: {
              id: "config_theme",
              set: {
                colors: colors.map((color: any) => ({
                  _key: nanoid(),
                  _type: "color",
                  name: color.name,
                  value: color.value,
                })),
              },
            },
          },
        ],
      },
      "POST",
    );
  }

  /**
   * Create random tokens
   */
  log("Creating random tokens");

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
  log("Creating Sanity WRITE token");

  obj = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/tokens`,

    { label: "preview-write", roleName: "editor" },
  );
  const SANITY_API_WRITE_TOKEN = obj.key;

  /**
   * Create Sanity READ token
   */

  log("Creating Sanity READ token");

  obj = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/tokens`,

    { label: "preview-read", roleName: "viewer" },
  );
  const SANITY_API_READ_TOKEN = obj.key;

  /**
   * Create Sanity CORS origins
   */

  log("Creating CORS origins");

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

  log("Creating Vercel project");

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

  log(vercelResult);

  sanityServerClient
    .patch(projectId)
    .set({ "vercel.id": VERCEL_PROJECT_ID })
    .commit();

  /**
   * Deploy Vercel
   */

  log("Creating Vercel deploy hook");

  await vFetch(
    `https://vercel.com/api/v2/projects/${VERCEL_PROJECT_ID}/deploy-hooks`,
    { name: "redeploy", ref: "main" },
  );

  log("Fetching Vercel project data");

  const vercelProject = await vFetch(
    `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}`,
    undefined,
    "GET",
  );

  log("Updating Sanity project with Vercel deploy hook");

  const VERCEL_REDEPLOY_HOOK = vercelProject.link.deployHooks[0].url;
  sanityServerClient
    .patch(projectId)
    .set({ "vercel.deploy_hook": VERCEL_REDEPLOY_HOOK })
    .commit();

  log("Deploying Vercel project with hook");

  await fetch(VERCEL_REDEPLOY_HOOK);

  log("Done");

  return NextResponse.json({
    ok: 1,
  });
}
