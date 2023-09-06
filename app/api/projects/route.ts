import { sanityServerClient } from "@/lib/sanity.server";
import { auth } from "@clerk/nextjs";
import { groq } from "next-sanity";
import { NextResponse } from "next/server";

const { exec } = require("child_process");

export async function POST(_req: Request) {
  const { userId }: { userId: string | null } = auth();
  const res = await _req.json();
  const projectName = res.projectName;

  if (!projectName) {
    return NextResponse.json({
      ok: 0,
    });
  }

  // create new project
  const { _id: projectId } = await sanityServerClient.create({
    _type: "project",
    title: projectName,
    log: ["Created project from API"],
  });

  /* Mirror logs to sanity */
  async function log(msg: string) {
    if (!msg.trim().length) return;
    msg = msg.replace("[0;36m", "").replace("[0m", "");

    sanityServerClient
      .patch(projectId)
      .insert("after", "log[-1]", [msg])
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
    .insert("after", "projects[-1]", [{ _type: "reference", _ref: projectId }])
    .commit({
      autoGenerateArrayKeys: true,
    });

  log(`Added project to user ${sanityUserId}`);

  const child = exec(
    `sh ./cli/tenant.sh "${projectName}" ${userId}`,
    (error: any, stdout: any, stderr: any) => {
      log(stdout);
      log(stderr);

      if (error !== null) {
        log(error);
      }
    },
  );

  return new Promise((resolve, reject) => {
    child.on("close", (code: number) => {
      if (code === 0) {
        return resolve(
          NextResponse.json({
            ok: 1,
          }),
        );
      }
    });
  });
}
