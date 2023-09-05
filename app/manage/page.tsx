import Link from "next/link";

async function getProjects() {
  const res = await fetch(
    `https://api.vercel.com/v9/projects?teamId=${process.env.VERCEL_TEAM_ID}&repoUrl=https://github.com/Mawla/growth-websites&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
      method: "get",
    },
  );

  const { projects } = await res.json();
  const projectNames = projects.map((project: any) => project.name);
  return { projects: projectNames };
}

export default async function Page({ params }: { params: { userid: string } }) {
  const projectData = await getProjects();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h2>Create new project</h2>
        <div>
          <Link
            href="/manage/create"
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
          >
            Create new
          </Link>
        </div>
      </div>

      <hr className="my-10" />
      <h1>All projects</h1>

      {projectData?.projects && (
        <ul>
          {projectData?.projects.map((project: any) => (
            <li key={project}>
              › <Link href={`/manage/${project}`}>{project}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
