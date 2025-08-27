"use client";

import { Button } from "@workspace/ui/components/button";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { getSelectTags } from "@/features/tags/_lib/queries";

import { ContactFormValues } from "../_lib/schema";
import { ContactForm } from "./contact-form";

interface Props {
  initialValues?: Partial<ContactFormValues>;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}
export default function ContactNewDialog({ initialValues, tags }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const router = useRouter();
  const onSubmit = async (data: ContactFormValues) => {
    try {
      await axios.post("/api/contacts", [data]);

      toast.success("Contact is created", {
        description: "Successful",
      });
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        <div>
          <p>Contacts can&apos;t be created. Please check with the support.</p>
          <p className="font-light">{error.response.statusText}</p>
        </div>
      );
    }

    setIsAddOpen(false);
  };

  return (
    <>
      <ResponsiveDialog
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        title="New Contact"
      >
        <ContactForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          tags={tags}
        />
      </ResponsiveDialog>
      <Button
        onClick={() => {
          setIsAddOpen(true);
        }}
        size="sm"
        variant="outline"
      >
        <Plus />
        New
      </Button>
    </>
  );
}
