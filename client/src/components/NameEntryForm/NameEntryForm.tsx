import { useCallback, useId, useState } from "react";
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from "src/components/FlippingLetterPool/FlippingLetterPool";
import { FieldError } from "src/components/FieldError/FieldError";
import { z } from "zod";
import {
  NAME_MAX_CHARACTER_LIMIT,
  NameEntryFormSchema,
  type FormError,
} from "./NameEntryForm.schema";
import "./NameEntryForm.css";

const NAME_ENTRY_FLIP_LINES = ["what's your name?"] as const;

type NameEntryFormProps = {
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorDismiss?: () => void;
};

export function NameEntryForm({
  onSubmit,
  isSubmitting,
  errorMessage,
  onErrorDismiss,
}: NameEntryFormProps) {
  const nameFieldId = useId();
  const nameErrorId = useId();
  const [name, setName] = useState("");
  const [formErrors, setFormErrors] = useState<FormError>(null);

  const nameError = formErrors?.fieldErrors.name;
  const hasNameError = Boolean(nameError?.length);
  const serverError = errorMessage;
  const hasServerError = serverError !== null;
  const displayError = nameError ?? serverError;
  const hasError = hasNameError || hasServerError;

  const clearErrors = useCallback(() => {
    setFormErrors((current) => (current ? null : current));
    if (hasServerError) {
      onErrorDismiss?.();
    }
  }, [hasServerError, onErrorDismiss]);

  const submit = useCallback(() => {
    const result = NameEntryFormSchema.safeParse({ name });

    if (!result.success) {
      setFormErrors(z.flattenError(result.error));
      return;
    }

    setFormErrors(null);
    onSubmit(result.data.name);
  }, [name, onSubmit]);

  return (
    <main className="shell shell-landing">
      <div className="stack-lg">
        <FlippingLetterPoolProvider lines={NAME_ENTRY_FLIP_LINES}>
          <form
            className="name-entry-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (isSubmitting) {
                return;
              }
              submit();
            }}
          >
            <div className="name-entry-form__field">
              <PooledFlippingTitle
                lineIndex={0}
                id={nameFieldId}
                as="h1"
                text={NAME_ENTRY_FLIP_LINES[0]}
                className="name-entry-form__prompt"
              />
              <input
                type="text"
                className={["field-input", hasError ? "field-input--error" : ""]
                  .filter(Boolean)
                  .join(" ")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearErrors();
                }}
                autoComplete="off"
                aria-labelledby={nameFieldId}
                aria-invalid={hasError}
                aria-describedby={hasError ? nameErrorId : undefined}
                disabled={isSubmitting}
                maxLength={NAME_MAX_CHARACTER_LIMIT}
              />
              <FieldError id={nameErrorId} message={displayError} />
            </div>

            <button
              type="submit"
              className="btn name-entry-form__submit"
              disabled={isSubmitting}
            >
              enter room
            </button>
          </form>
        </FlippingLetterPoolProvider>
      </div>
    </main>
  );
}
