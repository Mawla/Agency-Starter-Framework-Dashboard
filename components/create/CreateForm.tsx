"use client";
import { useToast } from "@/components/ui/use-toast";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import Spinner from "../ui/Spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contrast, darken, lighten } from "@/lib/helpers/color";
import Swatch from "./Swatch";

type ColorType = {
  name: string;
  value: string;
};

const EXAMPLE_PALETTE1: ColorType[] = [
  { name: "brand1", value: "#e63946" },
  { name: "brand2", value: "#f1faee" },
  { name: "brand3", value: "#a8dadc" },
  { name: "brand4", value: "#457b9d" },
  { name: "brand5", value: "#1d3557" },
];

// https://aicolors.co/
const EXAMPLE_PALETTE2: ColorType[] = [
  { name: "brand1", value: "#0D6E6E" },
  { name: "brand2", value: "#4a9d9c" },
  { name: "brand3", value: "#afffff" },
  { name: "brand4", value: "#FF3D3D" },
  { name: "brand5", value: "#ffe0c8" },
];

const EXAMPLE_PALETTE3: ColorType[] = [
  { name: "brand1", value: "#3F51B5" },
  { name: "brand2", value: "#757de8" },
  { name: "brand3", value: "#dedeff" },
  { name: "brand4", value: "#2196F3" },
  { name: "brand5", value: "#003f8f" },
];

const EXAMPLE_PALETTE4: ColorType[] = [
  { name: "brand1", value: "#eb9c64" },
  { name: "brand2", value: "#ff8789" },
  { name: "brand3", value: "#554e4f" },
  { name: "brand4", value: "#8fbf9f" },
  { name: "brand5", value: "#F5ECD7" },
];

const EXAMPLE_PALETTE5: ColorType[] = [
  { name: "brand1", value: "#005B99" },
  { name: "brand4", value: "#FFD700" },
  { name: "brand2", value: "#4e88ca" },
  { name: "brand3", value: "#b7e9ff" },
  { name: "brand5", value: "#e9aa2b" },
];

const EXAMPLE_PALETTES: { name: string; colors: ColorType[] }[] = [
  { name: "SaaS 1", colors: EXAMPLE_PALETTE1 },
  { name: "SaaS 2", colors: EXAMPLE_PALETTE2 },
  { name: "SaaS 3", colors: EXAMPLE_PALETTE3 },
  { name: "SaaS 4", colors: EXAMPLE_PALETTE4 },
  { name: "SaaS 5", colors: EXAMPLE_PALETTE5 },
];

export default function CreateForm() {
  const { toast } = useToast();
  const [state, setState] = useState<"stale" | "submitting" | "error">("stale");
  const router = useRouter();

  const [palette, setPalette] = useState<ColorType[]>([
    { name: "brand1", value: "" },
    { name: "brand1-light", value: "" },
    { name: "brand1-dark", value: "" },
    { name: "brand1-contrast", value: "" },
    { name: "brand2", value: "" },
    { name: "brand2-light", value: "" },
    { name: "brand2-dark", value: "" },
    { name: "brand2-contrast", value: "" },
    { name: "brand3", value: "" },
    { name: "brand3-light", value: "" },
    { name: "brand3-dark", value: "" },
    { name: "brand3-contrast", value: "" },
    { name: "brand4", value: "" },
    { name: "brand4-light", value: "" },
    { name: "brand4-dark", value: "" },
    { name: "brand4-contrast", value: "" },
    { name: "brand5", value: "" },
    { name: "brand5-light", value: "" },
    { name: "brand5-dark", value: "" },
    { name: "brand5-contrast", value: "" },
    { name: "text-light", value: "#9ca3af" },
    { name: "text-medium", value: "#4b5563" },
    { name: "text-dark", value: "#111827" },
    { name: "border-light", value: "#f5f5f5" },
    { name: "border-medium", value: "#d4d4d4" },
    { name: "border-dark", value: "#a3a3a3" },
  ]);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement;
      const projectName = form.projectName.value;
      if (!projectName) {
        form.projectName.focus();
        return toast({
          title: "Please select a project name",
          variant: "destructive",
        });
      }

      const dataset = form.dataset.value;
      if (!dataset) {
        return toast({
          title: "Please select a way to set up the CMS",
          variant: "destructive",
        });
      }

      if (palette.some((color) => !color.value)) {
        return toast({
          title: "Please select a color for each palette",
          variant: "destructive",
        });
      }

      async function createProject() {
        setState("submitting");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/create-project/`,
          {
            cache: "no-store",
            method: "POST",
            body: JSON.stringify({
              projectName,
              dataset,
              colors: palette,
            }),
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
    [router, palette],
  );

  const onSwatchChange = useCallback((name: string, value: string) => {
    const newPalette = [...palette];
    const index = newPalette.findIndex((color) => color.name === name);
    const indexLight = newPalette.findIndex(
      (color) => color.name === `${name}-light`,
    );
    const indexDark = newPalette.findIndex(
      (color) => color.name === `${name}-dark`,
    );
    const indexContrast = newPalette.findIndex(
      (color) => color.name === `${name}-contrast`,
    );
    newPalette[index].value = value;
    newPalette[indexLight].value = lighten(value);
    newPalette[indexDark].value = darken(value);
    newPalette[indexContrast].value = contrast(value);
    console.log(newPalette);
    setPalette(newPalette);
  }, []);

  const onPaletteClick = useCallback((palette: ColorType[]) => {
    onSwatchChange(palette[0].name, palette[0].value);
    onSwatchChange(palette[1].name, palette[1].value);
    onSwatchChange(palette[2].name, palette[2].value);
    onSwatchChange(palette[3].name, palette[3].value);
    onSwatchChange(palette[4].name, palette[4].value);
  }, []);

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
          <div className="grid w-full items-center gap-6">
            {/* name */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="projectName"
                placeholder="Name of your project"
                autoComplete="off"
                disabled={state === "submitting"}
              />
            </div>
            {/* dataset */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">CMS setup</Label>
              <Select name="dataset">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="How would you like to start the project?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="empty">An empty CMS</SelectItem>
                    <SelectItem value="qdtcnn4r">SaaS 1 Template</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* theme */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Colors</Label>
              <p className="text-gray-500 font-normal text-xs">
                Select 5 brand colors
              </p>
              <div className="grid grid-cols-5 gap-px">
                {["brand1", "brand2", "brand3", "brand4", "brand5"].map(
                  (name) => (
                    <div className="grid grid-cols-3 gap-px" key={name}>
                      <div className="col-span-3">
                        <Swatch
                          palette={palette}
                          onChange={onSwatchChange}
                          name={`${name}`}
                        />
                      </div>
                      <Swatch
                        palette={palette}
                        onChange={onSwatchChange}
                        name={`${name}-light`}
                      />
                      <Swatch
                        palette={palette}
                        onChange={onSwatchChange}
                        name={`${name}-dark`}
                      />
                      <Swatch
                        palette={palette}
                        onChange={onSwatchChange}
                        name={`${name}-contrast`}
                      />
                    </div>
                  ),
                )}
              </div>

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="xs" variant="outline" className="font-normal">
                      …select a color preset
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    <div className="grid gap-2">
                      {EXAMPLE_PALETTES.map((palette, index) => (
                        <div
                          key={palette.name}
                          onClick={() => onPaletteClick(palette.colors)}
                        >
                          <p className="uppercase text-xs font-bold">
                            {palette.name}
                          </p>
                          <div className="grid grid-cols-5 gap-1">
                            {palette.colors.map((color) => (
                              <div key={color.value}>
                                <span
                                  className="aspect-square block border border-[rgba(0,0,0,.1)]"
                                  style={{
                                    backgroundColor: color.value,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
