import { ImageResponse } from "next/server";

export const runtime = "edge";
export const contentType = "image/png";

// http://localhost:3000/logo/brand_name-00ff00/icon
export default async function Icon({ params }: { params: { style: string } }) {
  const [name, color] = params.style.split("-");

  const interSemiBold = fetch(
    new URL("../../../public/Inter-SemiBold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const interLight = fetch(
    new URL("../../../public/Inter-Light.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const width = name.length * 23;
  const height = 30;

  const projectName = name.split("_");
  const firstWord = projectName.slice(0, 1);
  const lastWords = projectName.slice(1).join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: `30px`,
          width: "100%",
          height: "100%",
          lineHeight: 0.5,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          color: `#${color}`,
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            fontWeight: 500,
          }}
        >
          {firstWord}
        </span>
        &nbsp;
        <span
          style={{
            fontWeight: 300,
            color: "red",
          }}
        >
          {lastWords}
        </span>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        {
          name: "Inter",
          data: await interSemiBold,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter",
          data: await interLight,
          style: "normal",
          weight: 300,
        },
      ],
    },
  );
}
