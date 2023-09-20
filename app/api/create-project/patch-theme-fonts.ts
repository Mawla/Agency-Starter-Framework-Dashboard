import { FontInfo } from "@/components/create/FontPicker";
import { sFetch } from "@/lib/queries/fetch";
import { nanoid } from "nanoid";

/**
 * This function is used to set the theme fonts
 */

export async function patchThemeFonts({
  SANITY_PROJECT_ID,
  headingFont,
  bodyFont,
  log,
}: {
  headingFont: FontInfo;
  SANITY_PROJECT_ID: string;
  bodyFont: FontInfo;
  log: (message: string) => void;
}) {
  log(`Importing fonts`);

  const stylesheets = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
    {
      mutations: [
        {
          patch: {
            id: "config_theme",
            setIfMissing: {
              stylesheets: [],
            },
          },
        },
        {
          patch: {
            id: "config_theme",
            unset: [
              'stylesheets[name=="Heading font"]',
              'stylesheets[name=="Body font"]',
            ],
          },
        },
        {
          patch: {
            id: "config_theme",
            insert: {
              before: "stylesheets[0]",
              items: [
                {
                  _key: nanoid(),
                  _type: "stylesheet",
                  name: "Heading font",
                  value: headingFont.cssImport,
                },
                {
                  _key: nanoid(),
                  _type: "stylesheet",
                  name: "Body font",
                  value: bodyFont.cssImport,
                },
              ],
            },
          },
        },
      ],
    },
    "POST",
  );

  const fontFamily = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
    {
      mutations: [
        {
          patch: {
            id: "config_theme",
            setIfMissing: {
              fontFamily: [],
            },
          },
        },
        {
          patch: {
            id: "config_theme",
            unset: ['fontFamily[name=="heading"]', 'fontFamily[name=="text"]'],
          },
        },
        {
          patch: {
            id: "config_theme",
            insert: {
              before: "fontFamily[0]",
              items: [
                {
                  _key: nanoid(),
                  name: "heading",
                  value: `${headingFont.name}, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                },
                {
                  _key: nanoid(),
                  name: "text",
                  value: `${bodyFont.name}, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                },
              ],
            },
          },
        },
      ],
    },
    "POST",
  );

  console.log(stylesheets);
  console.log(fontFamily);
}
