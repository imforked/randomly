import { z } from "zod";

export const userCreateBodySchema = z.object({
  name: z
    .string({ error: "Name required" })
    .trim()
    .min(1, { error: "Name required" })
    .max(50, { error: "A name can only have a maximum of 50 characters." }),
});
