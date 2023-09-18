"use client";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import Spinner from "../ui/Spinner";

export default function DeleteButton({ project }: { project: string }) {
  const [state, setState] = useState<"stale" | "deleting">("stale");

  const handleDeploy = useCallback(async () => {
    if (!confirm("Are you sure? This will delete everything forever.")) return;

    setState("deleting");

    await fetch("/api/delete-project", {
      method: "POST",
      body: JSON.stringify({ project }),
    });

    setState("stale");

    location.reload();
  }, []);

  return (
    <Button
      onClick={handleDeploy}
      disabled={state === "deleting"}
      variant="destructive"
    >
      {state === "stale" ? <>Delete</> : <Spinner />}
    </Button>
  );
}
