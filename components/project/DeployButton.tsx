"use client";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import Spinner from "../ui/Spinner";

export default function DeployButton({ project }: { project: string }) {
  const [state, setState] = useState<"stale" | "deploying">("stale");

  const handleDeploy = useCallback(async () => {
    setState("deploying");

    const res = await fetch("/api/deploy", {
      method: "POST",
      body: JSON.stringify({ project }),
    });

    const data = await res.json();
    setState("stale");
  }, []);

  return (
    <Button onClick={handleDeploy} disabled={state === "deploying"}>
      {state === "stale" ? <>Redeploy</> : <Spinner />}
    </Button>
  );
}
