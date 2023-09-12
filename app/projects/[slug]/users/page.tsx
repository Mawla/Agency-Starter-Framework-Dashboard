import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Invitations from "@/components/users/invitations";
import InviteForm from "@/components/users/invite-form";
import TeamMembers from "@/components/users/team-members";
import { getInvitations, getUsers } from "@/lib/queries/project";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const users = await getUsers(slug);
  const invitations = await getInvitations(slug);

  if (!slug) {
    notFound();
  }

  return (
    <div className="py-10 grid grid-cols-2 gap-10">
      <div className="grid gap-10">
        {users && <TeamMembers users={users} />}
        {invitations && <Invitations invitations={invitations} />}
      </div>

      <div>
        <InviteForm />

        <ul className="list-decimal list-inside grid gap-4 mt-4 font-mono text-sm">
          <li>
            Todo invite form:
            <ul className="list-inside ml-3 list-decimal">
              <li>add user in cms</li>
              <li>add to project</li>
              <li>send sanity invite</li>
              <li>send email invite</li>
            </ul>
          </li>
          <li>
            Todo team members:
            <ul className="list-inside ml-3 list-decimal">
              <li>remove user in cms</li>
              <li>remove sanity user from project</li>
            </ul>
          </li>
          <li>
            Todo invitations:
            <ul className="list-inside ml-3 list-decimal">
              <li>remove user in cms</li>
              <li>remove sanity user from project</li>
            </ul>
          </li>
          <li>
            Todo user sign up:
            <ul className="list-inside ml-3 list-decimal">
              <li>add user in cms or update if exists</li>
            </ul>
          </li>
          <li>
            Todo user delete:
            <ul className="list-inside ml-3 list-decimal">
              <li>set user inactive in cms</li>
              <li>remove user from sanity project</li>
            </ul>
          </li>
        </ul>
      </div>
      {/* <hr /> */}
      {/* <pre>{JSON.stringify(invitations, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(users, null, 2)}</pre> */}
    </div>
  );
}
