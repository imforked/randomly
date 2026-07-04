import { z } from "zod";

export const NAME_MAX_CHARACTER_LIMIT = 50;

export const NameEntryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "enter your name.")
    .max(
      NAME_MAX_CHARACTER_LIMIT,
      `keep it under ${NAME_MAX_CHARACTER_LIMIT} characters.`
    ),
});

export type FormError = ReturnType<
  typeof z.flattenError<z.infer<typeof NameEntryFormSchema>>
> | null;
