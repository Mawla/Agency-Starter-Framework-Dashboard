"server-only";

import groq from "groq";
import { sanityServerClient } from "../sanity.server";
import { sFetch, vFetch } from "./fetch";

/**
 * Get all project data across platforms
 */

export async function getProject(slug: string) {
  const data = await getProjectIds(slug);

  if (!data) return null;
  const vercelProject = await getVercelProject(data.vercelId);
  const sanityProject = await getSanityProject(data.sanityId);

  return {
    vercel: vercelProject,
    sanity: sanityProject,
  };
}

/**
 * Get project ids to query vercel and sanity
 */

export async function getProjectIds(slug: string) {
  const ids = await sanityServerClient.fetch(
    groq`*[_type == 'project' && slug.current == $slug][0]{
      _id,
      "vercelId": vercel.id,
      "sanityId": sanity.id
    }`,
    { slug },
  );

  if (!ids) return null;
  return ids;
}

/**
 * Get vercel id by slug
 */

export async function getVercelId(slug: string) {
  const vercelId = await sanityServerClient.fetch(
    groq`*[_type == 'project' && slug.current == $slug][0]{
      "vercelId": vercel.id,
    }.vercelId`,
    { slug },
  );

  if (!vercelId) return null;
  return vercelId;
}

/**
 * Get deployment url by slug
 */

export async function getProjectURL(slug: string) {
  const vercelId = await sanityServerClient.fetch(
    groq`*[_type == 'project' && slug.current == $slug][0]{
      "vercelId": vercel.id,
    }.vercelId`,
    { slug },
  );

  if (!vercelId) return null;

  const data = await getVercelProject(vercelId);
  if (data.error) return null;
  return data.targets.production.alias[0];
}

/**
 * Get deployment status by slug
 */

export async function getProjectStatus(slug: string) {
  const vercelId = await sanityServerClient.fetch(
    groq`*[_type == 'project' && slug.current == $slug][0]{
      "vercelId": vercel.id,
    }.vercelId`,
    { slug },
  );

  if (!vercelId) return null;

  const data = await getVercelProject(vercelId);
  if (data.error) return null;
  return data.targets.production.readyState;
}

/**
 * Get project data from vercel
 */

export async function getVercelProject(vercelId: string) {
  const data = await vFetch(
    `https://api.vercel.com/v9/projects/${vercelId}`,
    undefined,
    "GET",
  );

  if (data.error) return data;
  return data;
}

/**
 * Get project data from sanity
 */

export async function getSanityProject(sanityId: string) {
  const data = await sFetch(
    `https://api.sanity.io/v2021-06-07/projects/${sanityId}`,
    undefined,
    "GET",
  );

  if (data.error) return null;
  return data;
}

/**
 * Get deploy hook from sanity
 */

export async function getDeployHook(slug: string) {
  const hook = await sanityServerClient.fetch(
    groq`*[_type == 'project' && slug.current == $slug][0]{
      "hook": vercel.deploy_hook
    }.hook`,
    { slug },
  );

  if (!hook) return null;
  return hook;
}
