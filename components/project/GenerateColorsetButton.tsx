"use client";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import Spinner from "../ui/Spinner";

type ColorType = {
  name: string;
  value: string;
};

export default function GenerateColorsetButton({
  project,
}: {
  project: string;
}) {
  const [state, setState] = useState<"stale" | "deploying">("stale");
  const [brandColors, setBrandColors] = useState<ColorType[]>([
    {
      name: "brand1",
      value: "#e63946",
    },
    {
      name: "brand2",
      value: "#3bceac",
    },
    {
      name: "brand3",
      value: "#fddc5c",
    },
    {
      name: "brand4",
      value: "#9f7aea",
    },
    {
      name: "brand5",
      value: "#ffb997",
    },
  ]);

  const colors: ColorType[] = brandColors;

  const handleDeploy = useCallback(async () => {
    setState("deploying");

    const res = await fetch("/api/generate-colorset", {
      method: "POST",
      body: JSON.stringify({ project }),
    });

    const data = await res.json();
    setState("stale");

    if (!res.ok) {
      console.error(data);
      return;
    }
    setBrandColors(JSON.parse(data.colors));
  }, []);

  return (
    <>
      <Button onClick={handleDeploy} disabled={state === "deploying"}>
        {state === "stale" ? <>Generate colors</> : <Spinner />}
      </Button>

      {colors && (
        <ul className="grid grid-cols-4 gap-4 w-[500px] mt-10">
          {colors.map((color) => (
            <li key={color.name}>
              <span
                className="aspect-square block border border-[rgba(0,0,0,.1)]"
                style={{
                  backgroundColor: color.value,
                }}
              >
                {color.name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {colors && <pre>{JSON.stringify(colors, null, 2)}</pre>}
    </>
  );
}
