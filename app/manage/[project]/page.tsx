import Link from "next/link";
import cx from "classnames";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

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

  if (projectData.error) {
    return null;
  }

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

  if (!projectData) {
    notFound();
  }

  const state = projectData.vercel.targets.production.readyState;
  const url = projectData.vercel.targets.production.alias[0];

  return (
    <div className="py-10 border-t">
      project overview here
      {/* <p>Everything we know about this project from Vercel and Sanity:</p> */}
      {/* <pre>{JSON.stringify(projectData, null, 2)}</pre> */}
    </div>
  );
}
