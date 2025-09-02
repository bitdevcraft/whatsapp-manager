/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import axios from "axios";
import { Check, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().nonempty(),
});

type FormValue = z.infer<typeof FormSchema>;

export function CloneMarketingCampaign({
  recordId,
  ...props
}: Omit<React.ComponentProps<typeof ResponsiveDialog>, "children"> & {
  recordId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<FormValue>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(FormSchema),
  });

  const handleFormSubmit = async (data: FormValue) => {
    try {
      const response = await axios.post(
        `/api/whatsapp/marketing-campaigns/${recordId}`,
        data
      );

      toast.success("Campaign is duplicated", {
        description: "Successful",
      });

      router.push(`${pathname}/${response.data.data.id}`);
    } catch (error: any) {
      toast.error(
        <div>
          <p>Campaign can&apos;t be clone. Please check with the support.</p>
          <p className="font-light">{error.response.statusText}</p>
        </div>
      );
    }

    props.setIsOpen?.(false);
  };

  const onNo = () => {
    props.setIsOpen?.(false);
  };

  return (
    <ResponsiveDialog {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 w-full justify-center">
            <Button className="flex-1 w-full" type="submit">
              Yes <Check />
            </Button>
            <Button
              className="flex-1 w-full"
              onClick={onNo}
              variant="destructive"
            >
              No <X />
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
