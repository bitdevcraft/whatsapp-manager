"use client";

import { Button } from "@workspace/ui/components/button";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ContactFormValues } from "../_lib/schema";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ContactForm } from "./contact-form";
import { getSelectTags } from "@/features/tags/_lib/queries";

interface Props {
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}
export default function ContactNewDialog({ tags }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const router = useRouter();
  const onSubmit = async (data: ContactFormValues) => {
    try {
      await axios.post("/api/contacts", [data]);

      toast.success("Contact is created", {
        description: "Successful",
      });
      router.refresh();
    } catch (error: any) {
      toast.error(
        <div>
          <p>Contacts can't be created. Please check with the support.</p>
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
        title="Edit Custom Message"
      >
        <ContactForm onSubmit={onSubmit} tags={tags} />
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
