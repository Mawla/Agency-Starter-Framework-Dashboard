"use client";

import { sanityClient } from "@/lib/sanity.client";
import { useEffect, useState } from "react";

export default function CreateLog() {
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    // TODO: how do we log without exposing the secret token to the client?
    // idea: separate dataset for logging?
    const subscription = sanityClient
      .listen('*[_type == "project"][0]')
      .subscribe((update) => {
        console.log(`update.result`);
        setLog((prev) => [...prev, `update.result`]);
      });

    return subscription.unsubscribe();
  }, []);

  return <div>{log.join("\n")}</div>;
}
