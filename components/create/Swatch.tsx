import { ColorPicker } from "./ColorPicker";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type SwatchProps = {
  name: string;
  palette: { name: string; value: string }[];
  onChange: (name: string, color: string) => void;
};

export default function Swatch({ name, palette, onChange }: SwatchProps) {
  const color = palette.find((c) => c.name === name);

  if (name.indexOf("-") > -1) {
    return (
      <HoverCard>
        <HoverCardTrigger
          className="m-1 w-[calc(100%-8px)] aspect-square border border-[rgba(0,0,0,.05)] rounded-full"
          style={{ background: color?.value }}
        ></HoverCardTrigger>
        <HoverCardContent className="text-xs">
          {name.endsWith("-light") && (
            <span>The light color for {name.split("-")[0]}.</span>
          )}
          {name.endsWith("-dark") && (
            <span>The dark color for {name.split("-")[0]}.</span>
          )}
          {name.endsWith("-contrast") && (
            <span>
              The color used for text on {name.split("-")[0]} backgrounds.
            </span>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger className="cursor-pointer">
        <ColorPicker
          color={color?.value}
          onChange={(value) => onChange(name, value)}
        />
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="text-xs">Click to change the color for {name}.</div>
      </HoverCardContent>
    </HoverCard>
  );
}
