import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";

export default async function Page() {
  async function create(formData: FormData) {
    "use server";

    const name = formData.get("name");
    if (typeof name !== "string") {
      throw new Error("Invalid name");
    }

    const res = await fetch(
      `${
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"
      }/api/projects/`,
      {
        cache: "no-store",
        method: "POST",
        body: JSON.stringify({ name }),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to create project");
    }

    redirect(`/manage/${name}`);
  }

  const user: User | null = await currentUser();

  return (
    <div>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
      <div className="border-b pb-4 mb-4">
        ‹ <Link href="/manage">back to manage</Link>
      </div>

      <h1>Create new project</h1>

      <form action={create} className="mt-4 flex gap-1">
        <input
          type="text"
          name="name"
          placeholder="Project name"
          className="p-2 border"
        />

        <input
          type="submit"
          value="Create"
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
        />
      </form>
    </div>
  );
}
