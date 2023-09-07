"use client";
import { useEffect, useState } from "react";
import cx from "classnames";

export default function DeployStatus({ project }: { project: string }) {
  const [state, setState] = useState<"READY" | "ERROR" | "QUEUED" | "CANCELED">(
    "QUEUED",
  );

  useEffect(() => {
    async function getState() {
      const statusRes = await fetch("/api/deploy-status", {
        method: "POST",
        body: JSON.stringify({ project }),
      });

      const status = await statusRes.json();

      setState(status.status);
    }

    const timeout = setTimeout(getState, 10000);
    getState();

    return () => clearTimeout(timeout);
  }, [project]);

  return (
    <span
      className={cx("text-xs font-medium mr-2 px-2.5 py-0.5 rounded", {
        ["bg-green-100 text-green-800"]: state === "READY",
        ["bg-yellow-100 text-yellow-800"]: [
          "INITIALIZING",
          "BUILDING",
        ].includes(state),
        ["bg-red-100 text-red-800"]: state === "ERROR",
        ["bg-gray-100 text-gray-800"]: state === "QUEUED",
        ["bg-orange-100 text-orange-800"]: state === "CANCELED",
      })}
    >
      {state}
    </span>
  );
}
