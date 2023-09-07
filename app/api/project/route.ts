import { sanityServerClient } from "@/lib/sanity.server";
import { slugify } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import { groq } from "next-sanity";
import { NextResponse } from "next/server";

export async function POST(_req: Request) {
  const { userId }: { userId: string | null } = auth();
  const res = await _req.json();
  const projectName = slugify(res.projectName);

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

  obj = await sanityFetch(
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

  const SANITY_DATASET = "production";
  obj = await sanityFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/datasets/${SANITY_DATASET}`,
    undefined,
    "PUT",
  );

  /**
   * Create random tokens
   */

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

  obj = await sanityFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/tokens`,

    { label: "preview-write", roleName: "editor" },
  );
  const SANITY_API_WRITE_TOKEN = obj.key;

  /**
   * Create Sanity READ token
   */

  obj = await sanityFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/tokens`,

    { label: "preview-read", roleName: "viewer" },
  );
  const SANITY_API_READ_TOKEN = obj.key;

  /**
   * Create Sanity CORS origins
   */

  await sanityFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/cors`,

    {
      origin: "http://localhost:3333",
      allowCredentials: true,
    },
  );

  await sanityFetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/cors`,

    {
      origin: "http://localhost:3000",
      allowCredentials: true,
    },
  );

  await sanityFetch(
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

  return NextResponse.json({
    ok: 1,
  });
}

async function sanityFetch(url: string, body: any, method = "POST") {
  console.log(url, body);
  const params: any = {
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_SANITY_TOKEN}`,
      "Content-Type": "application/json",
    },
    method,
  };
  if (body) params.body = JSON.stringify(body);

  const res = await fetch(url, params);
  const obj = await res.json();
  return obj;
}
