import { z } from "zod";

export const OPTION_MAX_CHARACTER_LIMIT = 100;

export function createOptionsFormSchema(optionsPerGuest: number) {
  return z.object({
    options: z
      .array(z.string())
      .max(
        optionsPerGuest,
        `You can submit a max of ${optionsPerGuest} option${
          optionsPerGuest > 1 ? "s" : ""
        }.`
      )
      .superRefine((options, ctx) => {
        const trimmed = options.map((value) => value.trim());
        const filledIndexes = trimmed.flatMap((value, index) =>
          value.length > 0 ? [index] : []
        );

        if (filledIndexes.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: "Add at least 1 option.",
            path: [0],
          });
          return;
        }

        for (const index of filledIndexes) {
          const value = trimmed[index]!;

          if (value.length > OPTION_MAX_CHARACTER_LIMIT) {
            ctx.addIssue({
              code: "custom",
              message: `Option can have a max of ${OPTION_MAX_CHARACTER_LIMIT} characters.`,
              path: [index],
            });
          }
        }
      }),
  });
}

export type OptionsFormValues = {
  options: string[];
};

/**
 * Per-index option errors. `z.flattenError` only keeps the first path segment,
 * so array item issues are mapped here explicitly.
 */
export type FormError = {
  formErrors: string[];
  fieldErrors: {
    options: (string | undefined)[];
  };
} | null;

export function flattenOptionsFormError(
  error: z.ZodError,
  optionCount: number
): NonNullable<FormError> {
  const options: (string | undefined)[] = Array.from(
    { length: optionCount },
    () => undefined
  );
  const formErrors: string[] = [];

  for (const issue of error.issues) {
    if (issue.path[0] === "options" && typeof issue.path[1] === "number") {
      const index = issue.path[1];

      if (index >= 0 && index < optionCount && options[index] == null) {
        options[index] = issue.message;
      }

      continue;
    }

    formErrors.push(issue.message);
  }

  if (formErrors.length > 0 && options.every((message) => message == null)) {
    options[0] = formErrors[0];
    return {
      formErrors: formErrors.slice(1),
      fieldErrors: { options },
    };
  }

  return { formErrors, fieldErrors: { options } };
}

export function getSubmittedOptions(optionFields: string[]): string[] {
  return optionFields
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}
