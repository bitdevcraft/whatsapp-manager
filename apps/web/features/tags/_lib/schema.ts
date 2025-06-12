import { z } from "zod";

export const TagsFormSchema = z.object({
  name: z.string().nonempty(),
});
export type TagsFormValues = z.infer<typeof TagsFormSchema>;
