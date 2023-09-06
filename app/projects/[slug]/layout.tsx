import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import notFound from "../not-found";

import ProjectNav from "@/components/nav/ProjectNav";
import { getProjectStatus, getProjectURL } from "@/lib/queries/get-project";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
  req: any;
}) {
  const slug = params.slug;

  if (!slug) {
    notFound();
  }

  const url = await getProjectURL(slug);
  const state = await getProjectStatus(slug);

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
