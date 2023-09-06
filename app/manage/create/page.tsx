import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  return (
    <div className="grid grid-cols-4 gap-10 p-10">
      <div className="">
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={create}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Name of your project"
                    autoComplete="off"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/manage">Cancel</Link>
            </Button>
            <Button asChild>
              <input type="submit" value="Create" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="border h-full col-span-3 p-4 font-mono text-sm bg-gray-100">
        …deploy log here?
      </div>
    </div>
  );
}
