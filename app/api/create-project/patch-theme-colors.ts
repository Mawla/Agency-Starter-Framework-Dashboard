import { ColorType } from "@/components/create/CreateForm";
import { sFetch } from "@/lib/queries/fetch";
import { nanoid } from "nanoid";

/**
 * This function is used to set the theme colors
 */

export async function patchThemeColors({
  SANITY_PROJECT_ID,
  colors,
  log,
}: {
  SANITY_PROJECT_ID: string;
  colors: ColorType[];
  log: (message: string) => void;
}) {
  log(`Importing color palette`);
  await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
    {
      mutations: [
        {
          patch: {
            id: "config_theme",
            set: {
              colors: colors.map((color: any) => ({
                _key: nanoid(),
                _type: "color",
                name: color.name,
                value: color.value,
              })),
            },
          },
        },
      ],
    },
    "POST",
  );
}
