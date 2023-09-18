import { ColorPicker } from "./ColorPicker";

type SwatchProps = {
  name: string;
  palette: { name: string; value: string }[];
  onChange: (name: string, color: string) => void;
};

export default function Swatch({ name, palette, onChange }: SwatchProps) {
  const color = palette.find((c) => c.name === name);

  if (name.indexOf("-") > -1) {
    return (
      <div
        className="m-1 aspect-square border border-[rgba(0,0,0,.05)] rounded-full"
        style={{ background: color?.value }}
      />
    );
  }

  return (
    <ColorPicker
      color={color?.value}
      onChange={(value) => onChange(name, value)}
    />
  );
}
