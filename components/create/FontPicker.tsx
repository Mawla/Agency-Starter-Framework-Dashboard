"use client";

import FontPickerReact from "font-picker-react";
import { useState } from "react";

export type FontInfo = {
  cssImport: string;
  boldFontFileURL: string;
  regularFontFileURL: string;
  name: string;
};

export declare type Category =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace";

export declare type Script =
  | "arabic"
  | "bengali"
  | "chinese-simplified"
  | "chinese-traditional"
  | "cyrillic"
  | "cyrillic-ext"
  | "devanagari"
  | "greek"
  | "greek-ext"
  | "gujarati"
  | "gurmukhi"
  | "hebrew"
  | "japanese"
  | "kannada"
  | "khmer"
  | "korean"
  | "latin"
  | "latin-ext"
  | "malayalam"
  | "myanmar"
  | "oriya"
  | "sinhala"
  | "tamil"
  | "​telugu"
  | "thai"
  | "vietnamese";

export declare type Variant =
  | "100"
  | "100italic"
  | "200"
  | "200italic"
  | "300"
  | "300italic"
  | "regular"
  | "italic"
  | "500"
  | "500italic"
  | "600"
  | "600italic"
  | "700"
  | "700italic"
  | "800"
  | "800italic"
  | "900"
  | "900italic";

export declare type SortOption = "alphabet" | "popularity" | "trending";

export interface Font {
  family: string;
  id: string;
  category: Category;
  scripts: Script[];
  variants: Variant[];
  kind?: string;
  version?: string;
  lastModified?: string;
  files?: Record<Variant, string>;
}

export default function FontPicker({
  name,
  onChange,
}: {
  name: string;
  onChange: (fontInfo: FontInfo) => void;
}) {
  const [activeFont, setActiveFont] = useState("Roboto");

  function handleChange(nextFont: Font) {
    console.log(nextFont);
    setActiveFont(nextFont.family);

    // generate a css import like
    // @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,400&display=swap')
    const cssImportURL = `https://fonts.googleapis.com/css2?family=${nextFont.family.replace(
      / /g,
      "+",
    )}:ital,wght@${nextFont.variants
      .filter((variant) => variant.indexOf("italic") === -1)
      .map((variant) => `0,${variant === "regular" ? "400" : variant}`)
      .join(";")};1,400&display=swap&subset=latin`;
    const cssImport = `@import url('${cssImportURL}');`;

    const boldFontFileURL =
      nextFont.files?.[700] ||
      nextFont.files?.[800] ||
      nextFont.files?.[600] ||
      nextFont.files?.[500] ||
      nextFont.files?.regular ||
      nextFont.files?.[300] ||
      nextFont.files?.[200] ||
      nextFont.files?.[100] ||
      "";

    const regularFontFileURL =
      nextFont.files?.regular ||
      nextFont.files?.[500] ||
      nextFont.files?.[600] ||
      nextFont.files?.[300] ||
      nextFont.files?.regular ||
      nextFont.files?.[200] ||
      nextFont.files?.[100] ||
      nextFont.files?.[800] ||
      "";

    onChange({
      cssImport,
      boldFontFileURL,
      regularFontFileURL,
      name: nextFont.family,
    });
  }

  return (
    <div
      className={`
    [&_.dropdown-button]:!bg-transparent 
    [&_.dropdown-button]:!w-full 
    [&_[id^=font-picker]]:w-full
    [&_[id^=font-picker]]:shadow-none
    [&_[id^=font-picker]]:border
    [&_[id^=font-picker]]:rounded-md
    [&_[id^=font-picker]]:text-sm
    [&_[id^=font-picker]_ul]:bg-white
    [&_[id^=font-picker]_ul]:text-3xl
    [&_[id^=font-picker]_li]:!py-6
    [&_#font-picker-heading_li]:!font-bold
    `}
    >
      <FontPickerReact
        pickerId={name}
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY as string}
        activeFontFamily={activeFont}
        onChange={handleChange}
        scripts={["latin"]}
        limit={300}
        sort={"popularity" as any}
        filter={(font) =>
          font.family.toLowerCase().indexOf("icons") === -1 &&
          font.family.toLowerCase().indexOf("symbols") === -1
        }
      />
    </div>
  );
}
