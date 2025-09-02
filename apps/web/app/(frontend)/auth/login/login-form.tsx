"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import { authClient } from "@/lib/auth/auth-client";
import {
  type LoginWithEmailPasswordPayload,
  type LoginWithEmailPasswordResponse,
  LoginWithEmailPasswordSchema,
} from "@/types/auth";

export const useLoginWithEmailAndPassword = () => {
  return useMutation({
    mutationFn: async (
      payload: LoginWithEmailPasswordPayload
    ): Promise<LoginWithEmailPasswordResponse> => {
      const { data, error } = await authClient.signIn.email(
        {
          email: payload.email,
          password: payload.password,
          rememberMe: true,
        },
        {
          onError: (ctx) => {
            // Handle the error
            if (ctx.error.status === 403) {
              alert("Please verify your email address");
            }
            //you can also show the original error message
            alert(ctx.error.message);
          },
        }
      );

      if (error) throw new Error(error.message);

      const userData = data.user as typeof data.user;
      return {
        email_address: userData.email,
        id: userData.id,
        is_email_address_verified: userData.emailVerified,
        name: userData.name,
      };
    },
  });
};

export const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations("auth");

  const searchParams = useSearchParams();

  const path = searchParams.get("path");

  const form = useForm<LoginWithEmailPasswordPayload>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(LoginWithEmailPasswordSchema),
    reValidateMode: "onChange",
  });

  const login = useLoginWithEmailAndPassword();
  const onSubmit: SubmitHandler<LoginWithEmailPasswordPayload> = (data) => {
    login.mutate(data, {
      onSuccess: () => {
        router.push(`${path ?? "/ing/dashboard"}`);
      },
    });
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
        <CardDescription>{t("login.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("login.form.email.label")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>{t("login.form.password.label")}</FormLabel>
                      <Link
                        className="ml-auto inline-block text-sm underline"
                        href="/auth/forgot-password"
                      >
                        {t("login.form.forgot_password.label")}
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                disabled={login.isPending}
                type="submit"
              >
                {login.isPending ? (
                  <>
                    <Loader className="animate-spin" /> Logging in
                  </>
                ) : (
                  t("login_button")
                )}
              </Button>
              <Button className="w-full" type="button" variant="outline">
                {t("social_login.google")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("login.dont_have_account")}
              <Link className="ml-1 underline" href="/auth/signup">
                {t("signup_button")}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
