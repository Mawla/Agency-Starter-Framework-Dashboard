"use client";
import { useEffect, useState } from "react";
import cx from "classnames";

export default function DeployStatus({ project }: { project: string }) {
  const [status, setStatus] = useState<
    null | "READY" | "ERROR" | "QUEUED" | "CANCELED"
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getState() {
      setIsLoading(true);

      const statusRes = await fetch("/api/deploy-status", {
        method: "POST",
        body: JSON.stringify({ project }),
      });

      const status = await statusRes.json();

      setStatus(status.status);
      setIsLoading(false);
    }

    const timeout = setInterval(getState, 10000);
    getState();

    return () => clearInterval(timeout);
  }, [project]);

  if (status === null) return null;

  return (
    <span
      className={cx("text-xs font-medium mr-2 px-2.5 py-0.5 rounded", {
        ["animate-pulse"]: isLoading,
        ["bg-green-100 text-green-800"]: status === "READY",
        ["bg-yellow-100 text-yellow-800"]:
          status && ["INITIALIZING", "BUILDING"].includes(status),
        ["bg-red-100 text-red-800"]: status === "ERROR",
        ["bg-gray-100 text-gray-800"]: status === "QUEUED",
        ["bg-orange-100 text-orange-800"]: status === "CANCELED",
      })}
    >
      {status}
    </span>
  );
}
