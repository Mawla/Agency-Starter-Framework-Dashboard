import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getProjects } from "@/lib/queries/get-project";

export default async function Page({ params }: { params: { userid: string } }) {
  let projects = await getProjects();
  projects = projects?.filter(Boolean);
  const hasProjects = projects?.length > 0;

  return (
    <div className="grid grid-cols-6">
      <div className="col-span-1 p-10">
        <ul className="divide-y divide-y-gray-100">
          <li className="p-2">
            <Link href="/projects" className="font-semibold text-blue-600">
              Websites
            </Link>
          </li>
          <li className="p-2">
            <Link href="/account">Account</Link>
          </li>
        </ul>
      </div>
      <div className="col-span-5 p-10">
        <div className="flex flex-col gap-4">
          {!hasProjects && (
            <div className="flex flex-col gap-4">
              <h1 className="text-xl font-semibold">Welcome! </h1>
              <p>Create a new project to get started</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Create new website</CardTitle>
              <CardDescription>
                Deploy your new project in one-click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/projects/create">Create new</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {hasProjects && (
          <div className="border-t mt-10 pt-10">
            <h1 className="text-xl font-semibold mb-4">Your projects</h1>
            <div className="grid grid-cols-4 gap-4">
              {projects.map((project: any) => (
                <div key={project.slug}>
                  <Card>
                    <CardHeader>
                      {project.logo && (
                        <div
                          className="h-10"
                          style={{
                            background: project.background || "white",
                          }}
                        >
                          <img src={project.logo} height={40} />
                        </div>
                      )}

                      <CardTitle>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="hover:underline"
                        >
                          {project.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button asChild variant="default">
                          <Link href={`/projects/${project.slug}`}>Manage</Link>
                        </Button>
                        {project.url && (
                          <Button asChild variant="outline">
                            <Link
                              href={`https://${project.url}`}
                              target="_blank"
                              className="flex gap-1 items-center"
                            >
                              Visit
                              <ExternalLink size={16} strokeWidth={1.5} />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
