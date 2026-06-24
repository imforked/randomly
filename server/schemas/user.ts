import { z } from "zod";

export const userCreateBodySchema = z.object({
  name: z
    .string({ error: "Name required" })
    .trim()
    .min(1, { error: "Name required" }),
});
