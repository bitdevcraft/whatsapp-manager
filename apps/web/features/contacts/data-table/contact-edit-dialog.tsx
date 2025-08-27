import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getSelectTags } from "@/features/tags/_lib/queries";

import { ContactFormValues } from "../_lib/schema";
import { ContactForm } from "./contact-form";

export function ContactEditDialog({
  initialValues,
  tags,
  ...props
}: Omit<React.ComponentProps<typeof ResponsiveDialog>, "children"> & {
  initialValues?: Partial<ContactFormValues>;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}) {
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

    props.setIsOpen?.(false);
  };

  return (
    <ResponsiveDialog {...props}>
      <ContactForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        tags={tags}
      />
    </ResponsiveDialog>
  );
}
