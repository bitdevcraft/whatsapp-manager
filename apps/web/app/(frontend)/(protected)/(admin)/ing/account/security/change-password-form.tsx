"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
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
import { Loader2, Lock } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { authClient } from "@/lib/auth/auth-client";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/\d/, "Must contain at least one number")
  .regex(/[@$!%*?&]/, "Must contain at least one special character");

// 2️⃣ Change‑password form schema
export const changePasswordSchema = z
  .object({
    confirmPassword: z.string(),
    newPassword: passwordSchema,
    oldPassword: z.string().min(1, "Current password is required"),
  })
  .superRefine((data, ctx) => {
    // a) new vs confirm
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New passwords don't match",
        path: ["confirmPassword"],
      });
    }

    // b) new vs old (optional—but recommended)
    if (data.newPassword === data.oldPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must be different from your current password",
        path: ["newPassword"],
      });
    }
  });

// 3️⃣ TypeScript type
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordForm) => {
      const { data, error } = await authClient.changePassword({
        currentPassword: payload.oldPassword,
        newPassword: payload.newPassword,
        revokeOtherSessions: true,
      });

      if (error) throw new Error(error.message);

      return data;
    },
  });
};

export function ChangePassword() {
  const form = useForm<ChangePasswordForm>({
    defaultValues: {
      confirmPassword: "",
      newPassword: "",
      oldPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const changePassword = useChangePassword();

  const onSubmit: SubmitHandler<ChangePasswordForm> = (data) => {
    changePassword.mutate(data, {
      onSuccess: () => {},
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={changePassword.isPending}
              type="submit"
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
