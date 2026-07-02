import { z } from "zod";

export const userCreateBodySchema = z.object({
  name: z
    .string({ error: "name required" })
    .trim()
    .min(1, { error: "name required" })
    .max(50, { error: "a name can only have a maximum of 50 characters." }),
});
