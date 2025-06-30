import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().nonempty(),
  phoneNumber: z.string().nonempty(),
  email: z.string().optional(),
  tags: z.array(z.string()),
});
export type ContactFormValues = z.infer<typeof ContactFormSchema>;
