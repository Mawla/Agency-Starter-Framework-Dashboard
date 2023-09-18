import { slugify } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

type ColorType = {
  name: string;
  value: string;
};

const DEFAULT_COLORSET = [
  { name: "brand1", value: "#e63946" },
  { name: "brand2", value: "#f1faee" },
  { name: "brand3", value: "#a8dadc" },
  { name: "brand4", value: "#457b9d" },
  { name: "brand5", value: "#1d3557" },
];

export async function POST(_req: Request, res: NextApiResponse) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const params = await _req.json();
  const projectName = slugify(params.project);

  if (!projectName) {
    return NextResponse.json({
      ok: 0,
    });
  }

  const colors = (await getAIColorPalette()) || [];

  colors.push({
    name: "bg-light",
    value: colors.find((color: ColorType) => color.name === "brand2-light")
      .value,
  });
  colors.push({
    name: "bg-medium",
    value: colors.find((color: ColorType) => color.name === "brand2").value,
  });
  colors.push({
    name: "bg-dark",
    value: colors.find((color: ColorType) => color.name === "brand2-dark")
      .value,
  });

  colors.push({ name: "text-light", value: "#9ca3af" });
  colors.push({ name: "text-medium", value: "#4b5563" });
  colors.push({ name: "text-dark", value: "#111827" });

  colors.push({ name: "border-light", value: "#f5f5f5" });
  colors.push({ name: "border-medium", value: "#d4d4d4" });
  colors.push({ name: "border-dark", value: "#a3a3a3" });

  return NextResponse.json({
    ok: 1,
    colors,
  });
}

async function getAIColorPalette() {
  const prompt = "a brand palette for a SaaS business";

  const aiRes = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `
          [no-prose]
          [only json output]

          You are a designer and you have been tasked with creating a color palette for a new brand.

          Given this example colorset of brand colors in JSON:
          
          ${DEFAULT_COLORSET} 
          
          Please generate for me a similar color palette formatted as an array with objects containing a name (brand1, brand2, brand3, brand4 or brand5), the hexadecimal value and a human readable descriptive name. Like this:

          [
            { name: "brand1", value: "#e63946", description: "brand1" },
            ...
          ]
          
          It is important that the colors make a good match. 
          They must be pleasing to the eye and will be used on screens. 
          Color 1 must stand out.
          Color 2 must be contrasting to color 1.
          Color 4 and 5  must be close together.
          Color 3, 4 and 5 may not be too similar to color 1 and 2.

          Never return the same color twice.
          Never return pure white or pure black.
          Never return gray colors.
          Never return colors that are too similar to each other.
          
          Always return exactly 5 colors.

          The colors may not be too bright. They must be suitable for a SaaS business.
          
          The palette must be comply to this prompt: ${prompt}

          When you are done generating the brand palette, for each value 
          - generate a light with a lightness of 90.  Name it like 'brand1-light'.
          - generate a dark value with a lightness of 20.  Name it like 'brand1-dark'.
          - generate a contrast colour for accessible text with a contrast ratio of 4.5:1.  Name it like 'brand1-contrast'.

          Please sort the array by name.

          Always output JSON!
          `,
        },
      ],
      temperature: 0.7,
    }),
  });

  let obj = await aiRes.json();

  // retry once
  if (!obj?.choices?.[0]?.message?.content) {
    console.log("retrying once");
    obj = getAIColorPalette();
  }

  const result = obj.choices[0].message.content;
  console.log(result);

  return result;
}
