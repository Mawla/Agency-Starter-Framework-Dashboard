import React from "react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../ui/input";

export const ColorPicker = ({
  color,
  onChange,
}: {
  color?: string | undefined;
  onChange?: ((newColor: string) => void) | undefined;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="aspect-square border border-[rgba(0,0,0,.05)]"
          style={{ backgroundColor: color ? color : "#fafafa" }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-60 grid gap-1">
        <HexColorPicker color={color} onChange={onChange} />
        <Input value={color} onChange={(e) => onChange?.(e.target.value)} />
      </PopoverContent>
    </Popover>
  );
};
