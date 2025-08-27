"use client";

import { Button } from "@workspace/ui/components/button";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { TagsFormValues } from "../_lib/schema";
import { TagsForm } from "./tag-form";
export default function TagNewDialog() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const router = useRouter();
  const onSubmit = async (data: TagsFormValues) => {
    try {
      await axios.post("/api/tags", data);

      toast.success("Tag is created", {
        description: "Successful",
      });
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        <div>
          <p>Tags can&apos;t be created. Please check with the support.</p>
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
        <TagsForm onSubmit={onSubmit} />
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
