import { z } from "zod";
import { OPTIONS_PER_GUEST_MAX } from "../constants/roomConfigLimits.ts";
import { sanitizePlainText } from "../utils.ts";

const OPTION_MAX_CHARACTER_LIMIT = 100;

export const optionsCreateBodySchema = z.object({
  userId: z.string().min(1, { error: "userid required." }),
  options: z
    .array(
      z
        .string({ error: "option must contain at least one character." })
        .transform(sanitizePlainText)
        .pipe(
          z
            .string()
            .min(1, { error: "option must contain at least one character." })
            .max(OPTION_MAX_CHARACTER_LIMIT, {
              error: `option can have a max of ${OPTION_MAX_CHARACTER_LIMIT} characters.`,
            })
        )
    )
    .min(1, {
      error: `at least 1 option is required.`,
    })
    .max(OPTIONS_PER_GUEST_MAX, {
      error: `only ${OPTIONS_PER_GUEST_MAX} options are allowed.`,
    }),
});
