import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import notFound from "../not-found";

import { usePathname } from "next/navigation";
import ProjectNav from "@/components/nav/ProjectNav";

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

export default async function Layout({
  children,
  params,
  ...rest
}: {
  children: React.ReactNode;
  params: { project: string };
  req: any;
}) {
  const project = params.project;

  const projectData = await getProject(project);

  if (!projectData) {
    notFound();
  }

  const state = projectData.targets.production.readyState;
  const url = projectData.targets.production.alias[0];

  const navLinks = [
    {
      label: "Overview",
      href: `/manage/${project}`,
    },
    {
      label: "CMS",
      href: `/manage/${project}/cms`,
    },
    {
      label: "Users",
      href: `/manage/${project}/users`,
    },
    {
      label: "Settings",
      href: `/manage/${project}/settings`,
    },
  ];

  return (
    <div className="px-10 pt-10">
      <div className="pb-4 flex gap-10 items-center">
        <Button variant="outline">
          <Link href="/manage" className="flex gap-1 items-center">
            <ArrowLeft size={16} strokeWidth={1.5} /> back
          </Link>
        </Button>

        <div className="">
          <h1 className="uppercase font-semibold text-sm">{project}</h1>
        </div>

        <div className="">
          <ProjectNav links={navLinks} />
        </div>

        <div className="ml-auto flex gap-3 items-center">
          <span>
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
          </span>

          {url && (
            <Button asChild variant="outline">
              <Link
                href={`https://${url}`}
                target="_blank"
                className="flex gap-1 items-center"
              >
                Visit live
                <ExternalLink size={16} strokeWidth={1.5} />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
