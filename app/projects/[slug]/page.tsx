import DeployStatus from "@/components/project/DeployStatus";

import { getProject } from "@/lib/queries/project";
import { notFound } from "next/navigation";

async function getData(slug: string) {
  const project = getProject(slug);
  return project;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const project = params.slug;

  const projectData = await getData(project);

  if (!projectData) {
    notFound();
  }

  return (
    <div className="py-10 border-t">
      <div className="flex gap-4 items-center">
        <span>
          <DeployStatus project={project} />
        </span>
      </div>
    </div>
  );
}
