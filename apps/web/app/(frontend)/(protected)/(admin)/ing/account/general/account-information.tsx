"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export function AccountInformation({
  user,
}: {
  user: {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: null | string | undefined | undefined | undefined;
    name: string;
    updatedAt: Date;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
      </CardContent>
    </Card>
  );
}
