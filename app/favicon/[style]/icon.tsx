import { ImageResponse } from "next/server";

export const runtime = "edge";
export const contentType = "image/png";

// http://localhost:3000/favicon/XY-00ff00-ff0000-100/icon
export default async function Icon({ params }: { params: { style: string } }) {
  const [letter, color1, color2, size] = params.style.split("-");

  const interSemiBold = fetch(
    new URL("../../../public/Inter-SemiBold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: +size * 0.5,
          background: `#${color1}` || "black",
          width: "100%",
          height: "100%",
          lineHeight: 0.5,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: `#${color2}` || "white",
          textTransform: "uppercase",
          borderRadius: +size * 0.1,
        }}
      >
        {letter}
      </div>
    ),
    {
      width: +size,
      height: +size,
      fonts: [
        {
          name: "Inter",
          data: await interSemiBold,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
