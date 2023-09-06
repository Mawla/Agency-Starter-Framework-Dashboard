"server-only";

import groq from "groq";
import { sanityServerClient } from "../sanity.server";

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
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${vercelId}?teamId=${process.env.ADMIN_VERCEL_TEAM_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_VERCEL_API_TOKEN}`,
      },
      method: "get",
    },
  );

  const data = await res.json();
  if (data.error) return data;
  return data;
}

/**
 * Get project data from sanity
 */

export async function getSanityProject(sanityId: string) {
  const res = await fetch(
    `https://api.sanity.io/v2021-06-07/projects/${sanityId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SANITY_AUTH_TOKEN}`,
      },
      method: "get",
    },
  );

  const data = await res.json();
  if (data.error) return null;
  return data;
}
