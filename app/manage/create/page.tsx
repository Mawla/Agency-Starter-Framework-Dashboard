import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  async function create(formData: FormData) {
    "use server";

    const name = formData.get("name");
    if (typeof name !== "string") {
      throw new Error("Invalid name");
    }

    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/projects/`, {
      cache: "no-store",
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error("Failed to create project");
    }

    redirect(`/manage/${name}`);
  }

  return (
    <div>
      <div className="border-b pb-4 mb-4">
        ‹ <Link href="/manage">back to manage</Link>
      </div>

      <h1>Create new project</h1>

      <form
        action={create}
        className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
      >
        <input type="text" name="name" placeholder="Project name" />

        <input type="submit" value="Create" />
      </form>
    </div>
  );
}
