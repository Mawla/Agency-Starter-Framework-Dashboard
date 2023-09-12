"use client";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

export default function InviteForm() {
  return (
    <form>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Invite project members</CardTitle>
          <CardDescription>
            Send an invitation email to join the project.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="one-time-code"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Send invite</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
