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
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { authClient } from "@/lib/auth/auth-client";

const OrganizationSchema = z.object({
  name: z.string().nonempty(),
  slug: z.string().min(3),
});

type OrganizationPayload = z.infer<typeof OrganizationSchema>;

const useCreateOrganization = () => {
  return useMutation({
    mutationFn: async (payload: OrganizationPayload) => {
      const { error } = await authClient.organization.create({
        name: payload.name,
        slug: payload.slug,
      });

      if (error) throw new Error(error.message);
    },
  });
};

export function CreateOrganizationForm() {
  const router = useRouter();

  const createOrganization = useCreateOrganization();
  const onSubmit: SubmitHandler<OrganizationPayload> = async (data) => {
    const { error } = await authClient.organization.checkSlug({
      slug: data.slug,
    });

    if (error) {
      form.setError("slug", {
        message: "Domain isn't available",
        type: "custom",
      });

      return;
    }

    createOrganization.mutate(data, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  const form = useForm<OrganizationPayload>({
    defaultValues: {
      name: "",
      slug: "",
    },
    resolver: zodResolver(OrganizationSchema),
  });

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization&apos;s Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Proceed</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
