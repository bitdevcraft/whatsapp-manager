"use client";

import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  canInvite: boolean;
}

const inviteSchema = z.object({
  email: z.string().email().nonempty(),
  role: z.literal("member"),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function TeamInvitation({ canInvite }: Props) {
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (input: InviteValues) => {
    try {
      const { data, error } = await authClient.organization.inviteMember({
        email: input.email,
        role: input.role ?? "member",
        resend: true,
      });

      form.reset();

      if (error) {
        toast.error(`Invitation Failed: ${error.message}`);
        return;
      }

      toast.success(`Successfully invited ${data.email}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!canInvite} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Invite</Button>
          </form>
        </Form>
      </CardContent>
      {!canInvite && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You must be a team owner to invite new members.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
