import { currentUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/api";
import { redirect } from "next/navigation";

export default async function Page() {
  const user: User | null = await currentUser();

  if (!user) {
    return redirect("/sign-up");
  }

  return redirect("/manage");
}
