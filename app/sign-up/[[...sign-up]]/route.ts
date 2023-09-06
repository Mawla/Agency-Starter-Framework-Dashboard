export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  useCdn: false,
  apiVersion: "2023-05-03",
  token: process.env.SANITY_WRITE_TOKEN as string,
});

import type { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { createClient } from "@sanity/client";

const webhookSecret: string = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const payload = await req.json();
  const payloadString = JSON.stringify(payload);
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixIdTimeStamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  if (!svixId || !svixIdTimeStamp || !svixSignature) {
    return new Response("Error occured", {
      status: 400,
    });
  }
  // Create an object of the headers
  const svixHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixIdTimeStamp,
    "svix-signature": svixSignature,
  };
  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (_) {
    console.log("error");
    return new Response("Error occured", {
      status: 400,
    });
  }
  const { id } = evt.data;
  // Handle the webhook
  const eventType = evt.type;
  if (eventType === "user.created") {
    await client.create({
      _type: "user",
      clerk: {
        id,
        first_name: evt.data.first_name,
        last_name: evt.data.last_name,
      },
    });
    console.log(`User ${id} was ${eventType}`);
  }
  return new Response("", {
    status: 201,
  });
}
