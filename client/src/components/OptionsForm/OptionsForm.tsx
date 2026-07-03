import { useCallback, useId, useState } from "react";
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from "src/components/FlippingLetterPool/FlippingLetterPool";
import { FieldError } from "src/components/FieldError/FieldError";
import {
  OPTION_MAX_CHARACTER_LIMIT,
  createOptionsFormSchema,
  flattenOptionsFormError,
  getSubmittedOptions,
  type FormError,
} from "./OptionsForm.schema";
import "./OptionsForm.css";

const OPTIONS_FORM_FLIP_LINES = ["submit your options"] as const;

type OptionsFormProps = {
  optionsPerGuest: number;
  onSubmit: (options: string[]) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorDismiss?: () => void;
  disabled?: boolean;
};

export function OptionsForm({
  optionsPerGuest,
  onSubmit,
  isSubmitting,
  errorMessage,
  onErrorDismiss,
  disabled = false,
}: OptionsFormProps) {
  const promptId = useId();
  const optionErrorIdBase = useId();
  const serverErrorId = useId();
  const [optionFields, setOptionFields] = useState<string[]>([""]);
  const [formErrors, setFormErrors] = useState<FormError>(null);

  const optionErrors = formErrors?.fieldErrors.options ?? [];
  const hasServerError = errorMessage !== null;

  const trimmedValues = optionFields.map((value) => value.trim());
  const canAddAnother =
    optionFields.length < optionsPerGuest &&
    trimmedValues.every((value) => value.length > 0);
  const canRemove = optionFields.length > 1;
  const isFormLocked = isSubmitting || disabled;

  const clearErrors = useCallback(() => {
    setFormErrors((current) => (current ? null : current));
    if (hasServerError) {
      onErrorDismiss?.();
    }
  }, [hasServerError, onErrorDismiss]);

  const updateField = (index: number, value: string) => {
    setOptionFields((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    clearErrors();
  };

  const addField = () => {
    if (!canAddAnother) {
      return;
    }

    setOptionFields((prev) => [...prev, ""]);
    clearErrors();
  };

  const removeField = (index: number) => {
    if (!canRemove) {
      return;
    }

    setOptionFields((prev) => prev.filter((_, i) => i !== index));
    clearErrors();
  };

  const submit = useCallback(() => {
    const schema = createOptionsFormSchema(optionsPerGuest);
    const result = schema.safeParse({ options: optionFields });

    if (!result.success) {
      setFormErrors(
        flattenOptionsFormError(result.error, optionFields.length)
      );
      return;
    }

    setFormErrors(null);
    onSubmit(getSubmittedOptions(result.data.options));
  }, [onSubmit, optionFields, optionsPerGuest]);

  return (
    <FlippingLetterPoolProvider lines={OPTIONS_FORM_FLIP_LINES}>
      <form
        className="options-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (isFormLocked) {
            return;
          }
          submit();
        }}
      >
        <div className="options-form__field">
          <PooledFlippingTitle
            lineIndex={0}
            id={promptId}
            as="h2"
            text={OPTIONS_FORM_FLIP_LINES[0]}
            className="options-form__prompt"
          />

          <div
            className="options-form__inputs"
            role="group"
            aria-labelledby={promptId}
          >
            {optionFields.map((value, index) => {
              const optionError = optionErrors[index];
              const hasOptionError = Boolean(optionError);
              const showServerErrorOnFirst =
                index === 0 && !hasOptionError && hasServerError;
              const displayError = optionError ?? (showServerErrorOnFirst
                ? errorMessage
                : null);
              const hasError = Boolean(displayError);
              const errorId = hasOptionError
                ? `${optionErrorIdBase}-${index}`
                : showServerErrorOnFirst
                  ? serverErrorId
                  : undefined;

              return (
                <div key={index} className="options-form__input-row">
                  <input
                    type="text"
                    className={[
                      "field-input",
                      hasError ? "field-input--error" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    value={value}
                    onChange={(e) => updateField(index, e.target.value)}
                    autoComplete="off"
                    aria-label={`option ${index + 1}`}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                    disabled={isFormLocked}
                    maxLength={OPTION_MAX_CHARACTER_LIMIT}
                  />
                  {canRemove ? (
                    <button
                      type="button"
                      className="btn btn-secondary options-form__remove-btn"
                      aria-label={`remove option ${index + 1}`}
                      disabled={isFormLocked}
                      onClick={() => removeField(index)}
                    >
                      −
                    </button>
                  ) : null}
                  <FieldError id={errorId} message={displayError} />
                </div>
              );
            })}
            {canAddAnother ? (
              <button
                type="button"
                className="btn btn-secondary options-form__add-btn"
                aria-label="add another option"
                disabled={isFormLocked}
                onClick={addField}
              >
                +
              </button>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          className="btn options-form__submit"
          disabled={isFormLocked}
        >
          submit options
        </button>
      </form>
    </FlippingLetterPoolProvider>
  );
}
