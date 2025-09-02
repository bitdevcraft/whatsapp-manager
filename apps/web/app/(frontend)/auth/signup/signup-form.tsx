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
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import { authClient } from "@/lib/auth/auth-client";
import {
  type SignUpWithPasswordPayload,
  SignUpWithPasswordSchema,
} from "@/types/auth";

const useSignupWithPassword = () => {
  return useMutation({
    mutationFn: async (payload: SignUpWithPasswordPayload) => {
      const { data, error } = await authClient.signUp.email({
        email: payload.email,
        name: payload.name,
        password: payload.password,
      });

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

const useSignupWithGoogle = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
      });

      if (error) throw new Error(error.message);

      return data;
    },
  });
};

export const SignupForm = () => {
  const t = useTranslations("auth");
  const router = useRouter();

  const form = useForm<SignUpWithPasswordPayload>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(SignUpWithPasswordSchema),
    reValidateMode: "onChange",
  });

  const signup = useSignupWithPassword();
  const onSubmit: SubmitHandler<SignUpWithPasswordPayload> = (data) => {
    signup.mutate(data, {
      onSuccess: () => {
        router.push("/auth/login");
      },
    });
  };

  const signupWithGoogle = useSignupWithGoogle();
  const onSignupWithGoogle = () => {
    signupWithGoogle.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t("signup.title")}</CardTitle>
        <CardDescription>{t("signup.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("signup.form.name.label")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("signup.form.email.label")}</FormLabel>
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
                  <FormLabel>{t("signup.form.password.label")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={signup.isPending}
              type="submit"
            >
              {signup.isPending ? (
                <>
                  <Loader className="animate-spin" /> Signing Up
                </>
              ) : (
                t("signup_button")
              )}
            </Button>
            <Button
              className="w-full"
              onClick={onSignupWithGoogle}
              type="button"
              variant="outline"
            >
              {t("social_login.google")}
            </Button>
            <div className="mt-4 text-center text-sm">
              {t("signup.already_have_account")}
              <Link className="ml-1 underline" href="/auth/login">
                {t("login_button")}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
