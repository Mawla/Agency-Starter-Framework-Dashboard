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

async function getProjects() {
  const res = await fetch(
    `https://api.vercel.com/v9/projects?teamId=${process.env.ADMIN_VERCEL_TEAM_ID}&repoUrl=https://github.com/Mawla/growth-websites&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_VERCEL_API_TOKEN}`,
      },
      method: "get",
    },
  );

  const { projects } = await res.json();
  return {
    projects: projects.map((project: any) => ({
      name: project.name,
      url: project.targets.production.alias[0],
    })),
  };
}

export default async function Page({ params }: { params: { userid: string } }) {
  const projectData = await getProjects();

  return (
    <div className="grid grid-cols-6">
      <div className="col-span-1 p-10">
        <ul className="divide-y divide-y-gray-100">
          <li className="p-2">
            <Link href="/manage">Websites</Link>
          </li>
          <li className="p-2">
            <Link href="/account">Account</Link>
          </li>
        </ul>
      </div>
      <div className="col-span-5 p-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create new website</CardTitle>
                <CardDescription>
                  Deploy your new project in one-click.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/manage/create">Create new</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <hr className="my-10" />
          <h1 className="text-xl font-semibold">Your projects</h1>

          {projectData?.projects && (
            <div className="grid grid-cols-4 gap-4">
              {projectData?.projects.map((project: any) => (
                <div key={project.name}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Link
                          href={`/manage/${project.name}`}
                          className="hover:underline"
                        >
                          {project.name}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button asChild variant="default">
                          <Link href={`/manage/${project.name}`}>Manage</Link>
                        </Button>
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
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
