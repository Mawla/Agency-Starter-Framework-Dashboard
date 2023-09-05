import { NextResponse } from "next/server";

const { exec } = require("child_process");

export async function POST(_req: Request) {
  const res = await _req.json();
  const name = res.name;

  if (!name) {
    return NextResponse.json({
      ok: 0,
    });
  }

  const child = exec(
    `sh ./cli/test.sh "${name}"`,
    (error: any, stdout: any, stderr: any) => {
      console.log(stdout);
      console.log(stderr);

      if (error !== null) {
        console.log(error);
      }
    },
  );

  return new Promise((resolve, reject) => {
    child.on("close", (code: number) => {
      if (code === 0) {
        return resolve(
          NextResponse.json({
            ok: 1,
          }),
        );
      }
    });
  });
}

// type ProjectType = {
//   displayName: string;
//   id: string;
// };

// type SanityProjectType = {
//   id: string;
//   displayName: string;
//   studioHost: string;
//   organizationId: string;
//   metadata: string;
//   isBlocked: boolean;
//   isDisabled: boolean;
//   isDisabledByUser: boolean;
//   activityFeedEnabled: boolean;
//   createdAt: string;
//   members: {
//     id: "pvMhfUcsU";
//     createdAt: string;
//     updatedAt: string;
//     isCurrentUser: boolean;
//     isRobot: boolean;
//     roles: {
//       name: "administrator" | string;
//       title: string;
//       description: string;
//     }[];
//   }[];
//   features: [];
// };

// export async function POST(_req: Request) {
//   const res = await _req.json();
//   console.log(res.userid);

//   const allProjects: SanityProjectType[] = await fetch(
//     `https://api.sanity.io/v2021-06-07/projects`,
//     {
//       headers: { Authorization: `Bearer ${process.env.SANITY_AUTH_TOKEN}` },
//     },
//   ).then((res) => res.json());

//   console.log(
//     allProjects.filter((x) => x.displayName === "Rocket SaaS SGW")[0].members,
//   ); //map((x) => x.displayName));

//   const userProjects = allProjects.filter((project) => {
//     return project.members.some((member: any) => {
//       return member.id === res.userid;
//     });
//   });

//   return NextResponse.json({
//     projects: userProjects,
//     ok: 1,
//   });
// }
