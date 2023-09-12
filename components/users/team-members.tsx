"use client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default ({ users }: { users: SanityUserMember[] }) => {
  const removeMember = async (userId: string) => {
    alert(userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Invite your team members to collaborate.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {users.map((user) => (
          <div className="flex items-center space-x-4" key={user.id}>
            <Avatar>
              {user.imageUrl && <AvatarImage src={user.imageUrl} />}
              <AvatarFallback>
                {user.displayName?.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {user.displayName}
                {user.isCurrentUser && (
                  <span className="text-xs font-medium uppercase ml-2 px-1.5 py-0.5 rounded bg-slate-200">
                    you
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">{user.email} </p>
            </div>

            <div className="!ml-auto">
              <Button
                size="xs"
                variant="destructive"
                onClick={() => removeMember(user.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
