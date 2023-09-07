import { sanityServerClient } from "@/lib/sanity.server";
import { slugify } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import { groq } from "next-sanity";
import { NextResponse } from "next/server";
const exec = require("util").promisify(require("child_process").exec);

export async function POST(_req: Request) {
  const { userId }: { userId: string | null } = auth();
  const res = await _req.json();
  const projectName = slugify(res.projectName);
  const folderName = `${userId}-${projectName}`;

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

  // let p1 = await exec(`
  //   mkdir -p "/tmp/sgw/${folderName}"
  //   cd "/tmp/sgw"
  //   git clone "${process.env.ADMIN_GIT_URL}" "${folderName}"
  //   cd "./${folderName}"
  //   rm -rf .git
  //   touch ".env.development"
  // `);
  // console.log(p1.stdout);
  // console.log(p1.stderr);

  // log(`Cloned Git repo`);
  // log(`Creating new Sanity project`);

  // let p2 = await exec(`
  //   cd "/tmp/sgw/${folderName}"
  //   result=$(curl --silent POST 'https://api.sanity.io/v2021-06-07/projects' \
  //     -H "Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}" \
  //     -H 'Content-Type:application/json' \
  //     -d '{
  //         "displayName": "${projectName}",
  //         "organizationId": "${process.env.ADMIN_SANITY_ORGANISATION_ID}"
  //     }'
  //   )

  //   // TODO: add in sanity project.sanity.id

  //   sanityProjectId=$(echo $result 2>&1 | npx --yes groq-cli '(*).id' | xargs)
  //   echo $sanityProjectId

  //   # Write project id to .env.development
  //   echo "NEXT_PUBLIC_SANITY_PROJECT_ID=$sanityProjectId" >> ".env.development"
  //   echo "SANITY_STUDIO_API_PROJECT_ID=$sanityProjectId" >> ".env.development"

  //   # Generate dataset
  //   echo "Generating new Sanity dataset 'production'"
  //   dataset=$(curl --silent --request PUT "https://api.sanity.io/v2021-06-07/projects/$sanityProjectId/datasets/production" -H "Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}" -H 'Content-Type: application/json' -d '{ "aclMode": "public" }')

  //   echo "NEXT_PUBLIC_SANITY_DATASET=production" >> ".env.development"
  //   echo "SANITY_STUDIO_API_DATASET=production" >> ".env.development"

  //   # Generate preview secret
  //   echo "Generating preview secret"
  //   previewSecret=$(curl --silent "https://random-word-api.herokuapp.com/word?number=4" \-H "Accept: application/json" 2>&1 |  npx --yes groq-cli "*[0]+' '+*[1]+' '+*[2]+' '+*[3]" | xargs)
  //   echo "SANITY_PREVIEW_SECRET=$previewSecret" >> ".env.development"

  //   echo "Generating webhook secret"
  //   webhookSecret=$(curl --silent "https://random-word-api.herokuapp.com/word?number=4" \-H "Accept: application/json" 2>&1 |  npx --yes groq-cli "*[0]+''+*[1]+''+*[2]+''+*[3]" | xargs)
  //   echo "SANITY_WEBHOOK_SECRET=$webhookSecret" >> ".env.development"

  //   # Generate rest .env.development
  //   echo "Writing project path"
  //   echo "SANITY_STUDIO_PROJECT_PATH=/" >> ".env.development"

  //   echo "Generating read api key"
  //   writeJson=$(curl POST "https://api.sanity.io/v2021-06-07/projects/$sanityProjectId/tokens" -H "Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}" -H "Content-Type: application/json" --data-raw '{"label":"preview-write","roleName":"editor"}')
  //   sanityWriteToken=$(echo $writeJson | npx --yes groq-cli '(*).key' | xargs)
  //   echo "SANITY_API_WRITE_TOKEN=$sanityWriteToken" >> ".env.development"

  //   echo "Generating write api key"
  //   readJson=$(curl POST "https://api.sanity.io/v2021-06-07/projects/$sanityProjectId/tokens" -H "Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}" -H "Content-Type: application/json" --data-raw '{"label":"preview-read","roleName":"viewer"}')
  //   sanityReadToken=$(echo $readJson | npx --yes groq-cli '(*).key' | xargs)
  //   echo "SANITY_API_READ_TOKEN=$sanityReadToken" >> ".env.development"

  //   # Add CORS origins
  //   echo "Add localhost CORS origin to Sanity"
  //   cors1=$(curl --silent --request POST "https://api.sanity.io/v2021-06-07/projects/$sanityProjectId/cors" -H "Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}" -H 'Content-Type: application/json' -d '{ "origin": "http://localhost:3333", "allowCredentials": true }')
  //   cors2=$(curl --silent --request POST "https://api.sanity.io/v2021-06-07/projects/$sanityProjectId/cors" -H "Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}" -H 'Content-Type: application/json' -d '{ "origin": "http://localhost:3000", "allowCredentials": true }')
  //   cors3=$(curl --silent --request POST "https://api.sanity.io/v2021-06-07/projects/$sanityProjectId/cors" -H "Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}" -H 'Content-Type: application/json' -d '{ "origin": "https://${projectName}.vercel.app", "allowCredentials": true }')
  // `);

  // TODO invite Sanity users

  // console.log(p2.stdout);
  // console.log(p2.stderr);

  // log(`Done creating Sanity project`);
  console.log(`Set up Vercel project`);

  let buildProcess = await exec(`

    # ---
    # Create new Vercel project
    result=$(curl -X POST "https://api.vercel.com/v9/projects?teamId=${process.env.ADMIN_VERCEL_TEAM_ID}" \
      -H "Authorization: Bearer ${process.env.ADMIN_VERCEL_API_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "${projectName}",
        "commandForIgnoringBuildStep": "if [ \\"$VERCEL_ENV\\" == \\"production\\" ]; then exit 1; else exit 0; fi",
        "environmentVariables": [
          {
            "key": "TEST_encrypted",
            "target": "production",
            "type": "encrypted",
            "value": "SOME_STRING_VALUE"
          }
        ],
        "framework": "nextjs",
        "gitRepository": {
          "repo": "${process.env.ADMIN_GITHUB_REPO}",
          "type": "github"
        },
        "serverlessFunctionRegion": "dub1"
      }'
  )
  echo $result
  vercelProjectId=$(echo $result 2>&1 | npx --yes groq-cli '(*).id' | xargs)
  echo $vercelProjectId

  # ---
  # store vercel id in cms
  curl --request POST 'https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production' \
    -H 'Authorization: Bearer ${process.env.ADMIN_SANITY_TOKEN}' \
    -H 'Content-Type: application/json' \
    -d "{ \\"mutations\\": [{ \\"patch\\": { \\"id\\": \\"${projectId}\\", \\"set\\": { \\"vercel.id\\": \\"$vercelProjectId\\" }}}] }"

`);

  console.log(buildProcess.stdout);
  console.log(buildProcess.stderr);

  // TODO: can we just remove whole tmp dir logic??
  // await exec(`rm -rf "/tmp/sgw/${folderName}"`);

  return NextResponse.json({
    ok: 1,
  });
}
