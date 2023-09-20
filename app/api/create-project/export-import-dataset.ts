import { sFetch } from "@/lib/queries/fetch";
const nodeFetch = require("node-fetch");
import PQueue from "p-queue";

/**
 * This function is used to export the dataset
 * this has to be done by downloading all assets,
 * uploading them to the new project and then
 * updating the references in the documents
 */

export async function exportImportDataset({
  SANITY_PROJECT_ID,
  dataset,
  log,
}: {
  SANITY_PROJECT_ID: string;
  dataset: string;
  log: (message: string) => void;
}) {
  const queue = new PQueue({
    concurrency: 20,
    interval: 1000 / 25,
  });

  const assetConversionMap: Record<string, any> = {};

  /**
   * Download original asset and upload to new project
   * keeping a list of ids to update references in documents
   */

  async function downloadUpload(sanityId: string, doc: any) {
    console.log(`downloading ${doc.originalFilename}`);
    const image = await nodeFetch(doc.url);
    const imageBuffer = await image.buffer();

    console.log(`uploading ${doc.originalFilename}`);
    const result = await sFetch(
      `https://${sanityId}.api.sanity.io/v2021-03-25/assets/images/production`,
      imageBuffer,
      "POST",
      doc.mimeType || "image/jpeg",
      true,
    );
    if (result.error) {
      log(`error: ${result.error}`);
      return null;
    }

    console.log(`uploaded ${result.document._id}`);
    assetConversionMap[doc._id] = result.document._id;
  }

  // import template dataset
  console.log("fetching template dataset");
  const templateData = await sFetch(
    `https://${dataset}.api.sanity.io/v2023-09-14/data/query/production?query=*`,
    undefined,
    "GET",
  );
  console.log(`Got ${templateData.result.length} documents`);
  console.log("Starting asset download/upload");

  templateData.result
    .filter(
      ({ _type }: any) =>
        _type === "sanity.imageAsset" || _type === "sanity.fileAsset",
    )
    .map((doc: any) => {
      queue.add(() => downloadUpload(SANITY_PROJECT_ID, doc));
    });

  await queue.onIdle();
  log("Asset download/upload queue is idle, starting mutation import");

  // log(JSON.stringify(assetConversionMap));

  const mutations = templateData.result
    // filter out system documents
    .filter(({ _id }: any) => !_id.startsWith("_."))

    // filter out assets
    .filter(
      ({ _type }: any) =>
        _type !== "sanity.imageAsset" && _type !== "sanity.fileAsset",
    )

    // create mutation
    .map((doc: any) => {
      return {
        create: doc,
      };
    });

  let mutationsString = JSON.stringify(mutations);
  Object.entries(assetConversionMap).forEach(([oldId, uploadAssetId]) => {
    if (!uploadAssetId) {
      console.log(`Missing upload doc ${uploadAssetId}`);
      return;
    }
    mutationsString = mutationsString.replaceAll(oldId, uploadAssetId);
  });

  const importAction = await sFetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-09-14/data/mutate/production`,
    { mutations: JSON.parse(mutationsString) },
    "POST",
  );

  // log(importAction);
  if (importAction?.error) log(importAction?.error?.items);
}
