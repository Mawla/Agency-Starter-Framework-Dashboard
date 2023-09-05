import Link from "next/link";
import cx from "classnames";

async function getProject(project: string) {
  // get the project data from Vercel
  const projectRes = await fetch(
    `https://api.vercel.com/v9/projects/${project}?teamId=${process.env.ADMIN_VERCEL_TEAM_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_VERCEL_API_TOKEN}`,
      },
      method: "get",
    },
  );

  const projectData = await projectRes.json();

  // get the sanity project ID variable from Vercel
  const envVarSanityProjectId = projectData.env.find(
    (env: any) => env.key === "NEXT_PUBLIC_SANITY_PROJECT_ID",
  ).id;
  const sanityProjectIdEnvVarRes = await fetch(
    `https://vercel.com/api/v1/projects/${project}/env/${envVarSanityProjectId}?teamId=${process.env.ADMIN_VERCEL_TEAM_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_VERCEL_API_TOKEN}`,
      },
      method: "get",
    },
  );

  const sanityProjectIdEnvVar = await sanityProjectIdEnvVarRes.json();
  const sanityProjectId = sanityProjectIdEnvVar.value;

  // get project from Sanity
  const sanityProjectRes = await fetch(
    `https://api.sanity.io/v2021-06-07/projects/${sanityProjectId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SANITY_AUTH_TOKEN}`,
      },
      method: "get",
    },
  );
  const sanityProject = await sanityProjectRes.json();

  // sanity users
  const sanityUsersRes = await fetch(
    `https://api.sanity.io/v2021-10-04/projects/${sanityProjectId}/acl`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SANITY_AUTH_TOKEN}`,
      },
      method: "get",
    },
  );
  const sanityUsers = await sanityUsersRes.json();

  return {
    sanityProjectId,
    sanity: sanityProject,
    sanityUsers,
    vercel: projectData,
  };
}

export default async function Page({
  params,
}: {
  params: { project: string };
}) {
  const project = params.project;

  const projectData = await getProject(project);
  const state = projectData.vercel.targets.production.readyState;
  const url = projectData.vercel.targets.production.alias[0];

  return (
    <div>
      <div className="border-b pb-4 mb-4">
        ‹ <Link href="/manage">back to manage</Link>
      </div>

      <h1>{project}</h1>

      <span
        className={cx("text-xs font-medium mr-2 px-2.5 py-0.5 rounded", {
          ["bg-green-100 text-green-800"]: state === "READY",
          ["bg-yellow-100 text-yellow-800"]: [
            "INITIALIZING",
            "BUILDING",
          ].includes(state),
          ["bg-red-100 text-red-800"]: state === "ERROR",
          ["bg-gray-100 text-gray-800"]: state === "QUEUED",
          ["bg-orange-100 text-orange-800"]: state === "CANCELED",
        })}
      >
        {state}
      </span>

      <Link href={url}>{url}</Link>

      <hr className="my-10" />

      <p>Everything we know about this project from Vercel and Sanity:</p>
      <pre>{JSON.stringify(projectData, null, 2)}</pre>
    </div>
  );
}
