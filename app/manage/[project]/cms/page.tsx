import { notFound } from "next/navigation";

async function getProject(project: string) {
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

  return projectData;
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

  const url = projectData.targets.production.alias[0];
  return (
    <div>
      <iframe
        src={`https://${url}/cms/desk/en;allPages`}
        className="w-[calc(100vw-24px)] h-[calc(100vh-72px)] -mx-10"
      ></iframe>
    </div>
  );
}
