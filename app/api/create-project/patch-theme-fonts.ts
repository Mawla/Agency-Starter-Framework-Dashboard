import { FontInfo } from "@/components/create/FontPicker";
import { sFetch } from "@/lib/queries/fetch";
import { nanoid } from "nanoid";

/**
 * This function is used to set the theme fonts
 */

export async function patchThemeFonts({
  headingFont,
  SANITY_PROJECT_ID,
  bodyFont,
  log,
}: {
  headingFont: FontInfo;
  SANITY_PROJECT_ID: string;
  bodyFont: FontInfo;
  log: (message: string) => void;
}) {
  log(`Importing fonts`);
  await sFetch(
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
            insert: {
              stylesheets: {
                _key: nanoid(),
                _type: "stylesheet",
                name: "Heading font",
                value: headingFont.cssImport,
              },
            },
          },
        },
        {
          patch: {
            id: "config_theme",
            insert: {
              stylesheets: {
                _key: nanoid(),
                _type: "stylesheet",
                name: "Body font",
                value: bodyFont.cssImport,
              },
            },
          },
        },
        {
          patch: {
            id: "config_theme",
            insert: {
              fontFamily: {
                _key: nanoid(),
                name: "heading",
                value: `${headingFont.name} ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
              },
            },
          },
        },
        {
          patch: {
            id: "config_theme",
            insert: {
              fontFamily: {
                _key: nanoid(),
                name: "text",
                value: `${bodyFont.name} ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
              },
            },
          },
        },
      ],
    },
    "POST",
  );
}
