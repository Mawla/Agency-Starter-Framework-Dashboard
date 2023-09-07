/**
 * Sanity fetch
 */

export async function sFetch(url: string, body?: any, method = "POST") {
  const params: any = {
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_SANITY_TOKEN}`,
      "Content-Type": "application/json",
    },
    method,
  };
  if (body) params.body = JSON.stringify(body);

  const res = await fetch(url, params);
  const obj = await res.json();
  return obj;
}

/**
 * Vercel fetch
 */

export async function vFetch(url: string, body?: any) {
  const params: any = {
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  };
  if (body) params.body = JSON.stringify(body);

  const res = await fetch(url, params);
  const obj = await res.json();
  return obj;
}
