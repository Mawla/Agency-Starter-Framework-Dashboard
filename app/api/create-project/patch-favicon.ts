process.env.REAL_FAVICON_GENERATOR_API_KEY;

import { ColorType } from "@/components/create/CreateForm";
import { sFetch } from "@/lib/queries/fetch";
const nodeFetch = require("node-fetch");

/**
 * This function is used to generate a basic favicon
 * and upload the assets to Sanity
 */

export async function patchFavicon({
  SANITY_PROJECT_ID,
  projectName,
  colors,
  log,
}: {
  SANITY_PROJECT_ID: string;
  colors: ColorType[];
  log: (message: string) => void;
  projectName: string;
}) {
  log("generating icons");

  const letter1 = projectName[0].toUpperCase();
  const letter2 =
    projectName.indexOf(" ") > -1
      ? projectName.split(" ")[1][0].toUpperCase()
      : projectName[1].toUpperCase();
  const initials = `${letter1}${letter2}`;

  const params = {
    SANITY_PROJECT_ID,
    colors,
    log,
    initials,
  };

  const ico16 = await generateAndUpload({
    filename: "favicon.ico",
    size: 16,
    ...params,
  });
  const png16 = await generateAndUpload({
    filename: "favicon-16x16.png",
    size: 16,
    ...params,
  });
  const png32 = await generateAndUpload({
    filename: "favicon-32x32.png",
    size: 32,
    ...params,
  });
  const png180 = await generateAndUpload({
    filename: "apple-touch-icon.png",
    size: 180,
    ...params,
  });
  const png150 = await generateAndUpload({
    filename: "mstile-150x150.png",
    size: 150,
    ...params,
  });

  const faviconPatch = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
    {
      mutations: [
        {
          patch: {
            id: "config_seo",
            set: {
              favicon: {
                favicon_ico: {
                  _type: "file",
                  asset: {
                    _type: "reference",
                    _ref: ico16,
                  },
                },
                favicon_16x16_png: {
                  _type: "file",
                  asset: {
                    _type: "reference",
                    _ref: png16,
                  },
                },
                favicon_32x32_png: {
                  _type: "file",
                  asset: {
                    _type: "reference",
                    _ref: png32,
                  },
                },
                apple_touch_icon_png: {
                  _type: "file",
                  asset: {
                    _type: "reference",
                    _ref: png180,
                  },
                },
                mstile_150x150_png: {
                  _type: "file",
                  asset: {
                    _type: "reference",
                    _ref: png150,
                  },
                },
              },
            },
          },
        },
      ],
    },
    "POST",
  );

  if (faviconPatch.error) {
    log(faviconPatch.error.items[0]);
    return;
  }
  log(faviconPatch);
}

async function generateAndUpload({
  SANITY_PROJECT_ID,
  colors,
  log,
  filename,
  size,
  initials,
}: {
  SANITY_PROJECT_ID: string;
  colors: ColorType[];
  log: (message: string) => void;
  filename: string;
  size: number;
  initials: string;
}) {
  const brand1 = colors
    .find((color: any) => color.name === "brand1")
    ?.value.replace("#", "");
  const brand1Contrast = colors
    .find((color: any) => color.name === "brand1-contrast")
    ?.value.replace("#", "");

  const downloadResult = await nodeFetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}favicon/${initials}-${brand1}-${brand1Contrast}-${size}/icon`,
  );
  console.log(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}favicon/${initials}-${brand1}-${brand1Contrast}-${size}/icon`,
  );
  const downloadBuffer = await downloadResult.buffer();

  log(`uploading ${filename}`);

  const uploadResult = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-03-25/assets/files/production`,
    downloadBuffer,
    "POST",
    filename === "favicon.ico" ? "image/x-icon" : "image/png",
    true,
  );

  log(uploadResult);
  if (uploadResult.error) {
    log(uploadResult.error.items[0]);
    return;
  }

  return uploadResult.document._id;
}
