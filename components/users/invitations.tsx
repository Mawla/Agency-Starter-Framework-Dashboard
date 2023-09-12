"use client";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default ({ invitations }: { invitations: SanityInvite[] }) => {
  const revokeInvitation = async (invitationId: string) => {
    alert(invitationId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project invitations</CardTitle>
        <CardDescription>
          Invitations that have been sent, but not accepted yet. Changed your
          mind? Pending invitation may be revoked.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {invitations.map((invite) => (
          <div className="flex items-center space-x-4" key={invite.id}>
            <div>
              <p className="text-sm font-medium leading-none">{invite.email}</p>
              <p className="text-sm text-gray-500">{invite.email} </p>
            </div>

            <div className="!ml-auto">
              <Button
                size="xs"
                variant="destructive"
                onClick={() => revokeInvitation(invite.id)}
              >
                Revoke
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
