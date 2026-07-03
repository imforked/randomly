import { z } from "zod";
import { sanitizePlainText } from "../utils.ts";

export const userCreateBodySchema = z.object({
  name: z
    .string({ error: "name required" })
    .transform(sanitizePlainText)
    .pipe(
      z
        .string()
        .min(1, { error: "name required" })
        .max(50, { error: "a name can only have a maximum of 50 characters." })
    ),
});
