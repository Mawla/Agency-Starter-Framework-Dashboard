import DeployButton from "@/components/project/DeployButton";

import { getProject } from "@/lib/queries/get-project";
import { notFound } from "next/navigation";

async function getData(slug: string) {
  const project = getProject(slug);
  return project;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const project = params.slug;

  const projectData = await getData(project);

  console.log(projectData);

  if (
    !projectData ||
    !projectData.vercel ||
    projectData.vercel.error ||
    !projectData.sanity
  ) {
    notFound();
  }

  return (
    <div className="py-10 border-t">
      <DeployButton project={project} />
      <hr />
      project overview here
      <pre>
        {JSON.stringify(projectData.vercel.targets.production.alias, null, 2)}
      </pre>
      {/* <p>Everything we know about this project from Vercel and Sanity:</p> */}
      {/* <pre>{JSON.stringify(projectData, null, 2)}</pre> */}
    </div>
  );
}
