import { ColorType } from "@/components/create/CreateForm";
import { sFetch } from "@/lib/queries/fetch";
const nodeFetch = require("node-fetch");

/**
 * This function is used to generate a basic favicon
 * and upload the assets to Sanity
 */

export async function patchLogos({
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
  log("generating logo");

  const logo = await generateAndUpload({
    SANITY_PROJECT_ID,
    colors,
    log,
    projectName,
  });

  if (!logo) return;

  const patch = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
    {
      mutations: [
        {
          createIfNotExists: {
            _id: "navigation__i18n_en",
            _type: "navigation",
          },
        },
        { createIfNotExists: { _id: "footer__i18n_en", _type: "footer" } },
        {
          patch: {
            id: "navigation__i18n_en",
            set: {
              logo: {
                mobile: {
                  _type: "image",
                  asset: {
                    _type: "reference",
                    _ref: logo,
                  },
                },
                desktop: {
                  _type: "image",
                  asset: {
                    _type: "reference",
                    _ref: logo,
                  },
                },
              },
            },
          },
        },
        {
          patch: {
            id: "footer__i18n_en",
            set: {
              logo: {
                mobile: {
                  _type: "image",
                  asset: {
                    _type: "reference",
                    _ref: logo,
                  },
                },
                desktop: {
                  _type: "image",
                  asset: {
                    _type: "reference",
                    _ref: logo,
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
  log(patch);
  if (patch.error) log(patch.error.items[0]);
}

async function generateAndUpload({
  SANITY_PROJECT_ID,
  colors,
  log,
  projectName,
}: {
  SANITY_PROJECT_ID: string;
  colors: ColorType[];
  log: (message: string) => void;
  projectName: string;
}) {
  const color = colors
    .find((color: any) => color.name === "brand2-contrast")
    ?.value.replace("#", "");

  projectName = projectName.replace(/\s|-/g, "_").toLowerCase();

  const downloadResult = await nodeFetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}logo/${projectName}-${color}/icon`,
  );
  console.log(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}logo/${projectName}-${color}/icon`,
  );
  const downloadBuffer = await downloadResult.buffer();

  const uploadResult = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-03-25/assets/images/production`,
    downloadBuffer,
    "POST",
    "image/png",
    true,
  );

  console.log(uploadResult);
  if (uploadResult.error) {
    console.log(uploadResult.error.items[0]);
    return null;
  }

  return uploadResult?.document?._id;
}
