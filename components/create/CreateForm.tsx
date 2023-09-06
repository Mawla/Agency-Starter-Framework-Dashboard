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
          `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/projects/`,
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
        router.push(`/projects/${projectName}`);
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

          {state === "submitting" && (
            <svg
              width={24}
              height={24}
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur={0.5}
                  values="0 12 12;360 12 12"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          )}

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
