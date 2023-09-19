import { Button } from "@/components/ui/button";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

import ProjectNav from "@/components/nav/ProjectNav";
import { getProjectURL } from "@/lib/queries/get-project";
import DeployStatus from "@/components/project/DeployStatus";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const slug = params.slug;

  if (!slug) {
    redirect("/projects");
  }

  const url = await getProjectURL(slug);

  const navLinks = [
    {
      label: "Overview",
      href: `/projects/${slug}`,
    },
    {
      label: "CMS",
      href: `/projects/${slug}/cms`,
    },
    {
      label: "Users",
      href: `/projects/${slug}/users`,
    },
    {
      label: "Settings",
      href: `/projects/${slug}/settings`,
    },
  ];

  return (
    <div className="px-10 pt-10">
      <div className="pb-4 flex gap-10 items-center">
        <div className="flex shrink-0 items-center">
          <Button variant="ghost">
            <Link href="/projects" className="flex gap-1 items-center">
              <ArrowLeft size={16} strokeWidth={1.5} /> back
            </Link>
          </Button>

          <h1 className="uppercase font-semibold text-md">{slug}</h1>
        </div>

        <div className="">
          <ProjectNav links={navLinks} />
        </div>

        <div className="ml-auto flex gap-3 items-center">
          <span>
            <DeployStatus project={slug} />
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
