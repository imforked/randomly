import { z } from "zod";
import { OPTIONS_PER_GUEST_MAX } from "../constants/roomConfigLimits.ts";

export const optionsCreateBodySchema = z.object({
  userId: z.string().min(1, { error: "userid required." }),
  options: z
    .array(
      z
        .string({ error: "option must contain at least one character." })
        .trim()
        .min(1, { error: "option must contain at least one character." })
    )
    .min(1, {
      error: `at least 1 option is required.`,
    })
    .max(OPTIONS_PER_GUEST_MAX, {
      error: `only ${OPTIONS_PER_GUEST_MAX} options are allowed.`,
    }),
});
