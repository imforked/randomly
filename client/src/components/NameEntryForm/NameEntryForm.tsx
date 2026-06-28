import { useId, useState } from "react";
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from "src/components/FlippingLetterPool/FlippingLetterPool";
import "./NameEntryForm.css";

const NAME_ENTRY_FLIP_LINES = ["What's your name?"] as const;

const NAME_MAX_LENGTH = 50;

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
  const errorId = useId();
  const [name, setName] = useState("");

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting;
  const hasError = errorMessage !== null;

  return (
    <main className="shell shell-landing">
      <div className="stack-lg">
        <FlippingLetterPoolProvider lines={NAME_ENTRY_FLIP_LINES}>
          <form
            className="name-entry-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!canSubmit) return;
              onSubmit(trimmedName);
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
                className={[
                  "field-input",
                  hasError ? "name-entry-form__input--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (hasError) onErrorDismiss?.();
                }}
                autoComplete="off"
                aria-labelledby={nameFieldId}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
                disabled={isSubmitting}
                maxLength={NAME_MAX_LENGTH}
              />
              {hasError ? (
                <p
                  id={errorId}
                  className="name-entry-form__error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="btn name-entry-form__submit"
              disabled={!canSubmit}
            >
              Enter Room
            </button>
          </form>
        </FlippingLetterPoolProvider>
      </div>
    </main>
  );
}
