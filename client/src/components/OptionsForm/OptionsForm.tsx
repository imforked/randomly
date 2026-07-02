import { useId, useState } from "react";
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from "src/components/FlippingLetterPool/FlippingLetterPool";
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
  const errorId = useId();
  const [optionFields, setOptionFields] = useState<string[]>([""]);

  const hasError = errorMessage !== null;
  const trimmedValues = optionFields.map((value) => value.trim());
  const optionsToSubmit = trimmedValues.filter((value) => value.length > 0);
  const canSubmit =
    optionsToSubmit.length > 0 && !isSubmitting && !disabled;
  const canAddAnother =
    optionFields.length < optionsPerGuest &&
    trimmedValues.every((value) => value.length > 0);
  const canRemove = optionFields.length > 1;

  const updateField = (index: number, value: string) => {
    setOptionFields((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (hasError) {
      onErrorDismiss?.();
    }
  };

  const addField = () => {
    if (!canAddAnother) {
      return;
    }

    setOptionFields((prev) => [...prev, ""]);
  };

  const removeField = (index: number) => {
    if (!canRemove) {
      return;
    }

    setOptionFields((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <FlippingLetterPoolProvider lines={OPTIONS_FORM_FLIP_LINES}>
      <form
        className="options-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) {
            return;
          }
          onSubmit(optionsToSubmit);
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
            {optionFields.map((value, index) => (
              <div key={index} className="options-form__input-row">
                <input
                  type="text"
                  className={[
                    "field-input",
                    hasError ? "options-form__input--error" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  value={value}
                  onChange={(e) => updateField(index, e.target.value)}
                  autoComplete="off"
                  aria-label={`option ${index + 1}`}
                  disabled={isSubmitting || disabled}
                />
                {canRemove ? (
                  <button
                    type="button"
                    className="btn btn-secondary options-form__remove-btn"
                    aria-label={`remove option ${index + 1}`}
                    disabled={isSubmitting || disabled}
                    onClick={() => removeField(index)}
                  >
                    −
                  </button>
                ) : null}
              </div>
            ))}
            {canAddAnother ? (
              <button
                type="button"
                className="btn btn-secondary options-form__add-btn"
                aria-label="add another option"
                disabled={isSubmitting || disabled}
                onClick={addField}
              >
                +
              </button>
            ) : null}
          </div>

          {hasError ? (
            <p id={errorId} className="options-form__error" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="btn options-form__submit"
          disabled={!canSubmit}
        >
          submit options
        </button>
      </form>
    </FlippingLetterPoolProvider>
  );
}
