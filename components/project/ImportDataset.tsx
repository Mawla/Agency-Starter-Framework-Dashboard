"use client";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import Spinner from "../ui/Spinner";

export default function ImportDataset({ project }: { project: string }) {
  const [state, setState] = useState<"stale" | "deploying">("stale");

  const handleImport = useCallback(async () => {
    setState("deploying");

    const res = await fetch("/api/export-dataset", {
      method: "POST",
      body: JSON.stringify({ project, templateId: "qdtcnn4r" }),
    });

    const data = await res.json();
    setState("stale");
  }, []);

  return (
    <Button onClick={handleImport} disabled={state === "deploying"}>
      {state === "stale" ? <>Import dataset</> : <Spinner />}
    </Button>
  );
}
