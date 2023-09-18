import React from "react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
          className="aspect-square border border-[rgba(0,0,0,0.05)])]"
          style={{ backgroundColor: color ? color : undefined }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <HexColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};
