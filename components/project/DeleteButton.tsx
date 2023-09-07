"use client";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import Spinner from "../ui/Spinner";

export default function DeleteButton({ project }: { project: string }) {
  const [state, setState] = useState<"stale" | "deleting">("stale");

  const handleDeploy = useCallback(async () => {
    setState("deleting");

    await fetch("/api/delete-project", {
      method: "POST",
      body: JSON.stringify({ project }),
    });

    setState("stale");
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
