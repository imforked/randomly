import { z } from "zod";
import { OPTIONS_PER_GUEST_MAX } from "../constants/roomConfigLimits.ts";

export const optionsCreateBodySchema = z.object({
  userId: z.string().min(1, { error: "userId required." }),
  options: z
    .array(
      z
        .string({ error: "Option must contain at least one character." })
        .trim()
        .min(1, { error: "Option must contain at least one character." })
    )
    .min(1, {
      error: `At least 1 option is required.`,
    })
    .max(OPTIONS_PER_GUEST_MAX, {
      error: `Only ${OPTIONS_PER_GUEST_MAX} options are allowed.`,
    }),
});
