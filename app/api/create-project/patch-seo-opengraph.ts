import { ColorType } from "@/components/create/CreateForm";
import { FontInfo } from "@/components/create/FontPicker";
import { sFetch } from "@/lib/queries/fetch";
const nodeFetch = require("node-fetch");

/**
 * This function is used to set the
 * opengraph title and meta font and text color
 */

export async function patchSeoOpenGraph({
  headingFont,
  SANITY_PROJECT_ID,
  colors,
  log,
}: {
  headingFont: FontInfo;
  SANITY_PROJECT_ID: string;
  colors: ColorType[];
  log: (message: string) => void;
}) {
  log(`Importing opengraph ttf fonts`);
  const ogTitleFontFile = await nodeFetch(headingFont.boldFontFileURL);
  const ogTitleFontFileBuffer = await ogTitleFontFile.buffer();
  const ogTitleFontFileResult = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-03-25/assets/files/production`,
    ogTitleFontFileBuffer,
    "POST",
    "font/ttf",
    true,
  );
  const ogMetaFontFile = await nodeFetch(headingFont.regularFontFileURL);
  const ogMetaFontFileBuffer = await ogMetaFontFile.buffer();
  const ogMetaFontFileResult = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-03-25/assets/files/production`,
    ogMetaFontFileBuffer,
    "POST",
    "font/ttf",
    true,
  );

  // set font references
  await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
    {
      mutations: [
        {
          patch: {
            id: "config_seo",
            set: {
              "opengraphimage.titleFont": {
                _type: "file",
                asset: {
                  _type: "reference",
                  _ref: ogTitleFontFileResult.document._id,
                },
              },
            },
          },
        },
        {
          patch: {
            id: "config_seo",
            set: {
              "opengraphimage.metaFont": {
                _type: "file",
                asset: {
                  _type: "reference",
                  _ref: ogMetaFontFileResult.document._id,
                },
              },
            },
          },
        },
        {
          patch: {
            id: "config_seo",
            set: {
              "opengraphimage.color": colors.find(
                (color: any) => color.name === "brand1",
              )?.value,
            },
          },
        },
      ],
    },
    "POST",
  );
}
