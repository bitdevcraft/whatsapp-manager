import { User } from "@workspace/db/schema";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import React from "react";

import { getMember } from "./_lib/queries";

interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getMember>>]>;
}

export function TeamList({ promises }: Props) {
  const getUserDisplayName = (user: Pick<User, "email" | "id" | "name">) => {
    return user.name || user.email || "Unknown User";
  };

  const [data] = React.use(promises);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[50vh] ">
          {data.map((el) => (
            <div className="flex items-center space-x-4 mb-4" key={el.id}>
              <Avatar>
                {/* 
                    This app doesn't save profile images, but here
                    is how you'd show them:

                    <AvatarImage
                      src={member.user.image || ''}
                      alt={getUserDisplayName(member.user)}
                    />
                  */}
                <AvatarFallback>
                  {getUserDisplayName(el.user)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{getUserDisplayName(el.user)}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {el.role}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
