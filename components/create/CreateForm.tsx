"use client";

import { Input } from "../ui/input";
import { FormEvent, useCallback, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import Spinner from "../ui/Spinner";

export default function CreateForm() {
  const [state, setState] = useState<"stale" | "submitting" | "error">("stale");
  const router = useRouter();

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement;
      const projectName = form.projectName.value;
      if (!projectName) return;

      async function createProject() {
        setState("submitting");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/project/`,
          {
            cache: "no-store",
            method: "POST",
            body: JSON.stringify({ projectName }),
          },
        );

        if (!res.ok) {
          setState("error");
          throw new Error("Failed to create project");
        }

        setState("stale");
        router.push(`/projects/${slugify(projectName)}`);
      }

      createProject();
    },
    [router],
  );

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="projectName"
                placeholder="Name of your project"
                autoComplete="off"
                disabled={state === "submitting"}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {state === "stale" && (
            <Button variant="outline" asChild>
              <Link href="/projects">Cancel</Link>
            </Button>
          )}

          {state === "submitting" && <Spinner />}

          <Button asChild>
            <input
              type="submit"
              value="Create"
              disabled={state === "submitting"}
            />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
