import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import { ContactForm } from "./contact-form";
import { ContactFormValues } from "../_lib/schema";
import { getSelectTags } from "@/features/tags/_lib/queries";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

export function ContactEditDialog({
  tags,
  initialValues,
  ...props
}: Omit<React.ComponentProps<typeof ResponsiveDialog>, "children"> & {
  tags: Awaited<ReturnType<typeof getSelectTags>>;
  initialValues?: Partial<ContactFormValues>;
}) {
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

    props.setIsOpen?.(false);
  };

  return (
    <ResponsiveDialog {...props}>
      <ContactForm
        onSubmit={onSubmit}
        tags={tags}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
}
