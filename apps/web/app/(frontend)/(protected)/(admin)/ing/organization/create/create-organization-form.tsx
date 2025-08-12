"use client";

import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

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
        type: "custom",
        message: "Domain isn't available",
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
    resolver: zodResolver(OrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
