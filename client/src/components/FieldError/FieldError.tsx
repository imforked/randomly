import "./FieldError.css";

type FieldErrorProps = {
  id?: string;
  /** First message is shown when an array is passed (Zod `fieldErrors`). */
  message?: string | readonly string[] | null;
  className?: string;
};

function resolveMessage(
  message: FieldErrorProps["message"]
): string | null {
  if (message == null) {
    return null;
  }

  if (typeof message === "string") {
    return message.length > 0 ? message : null;
  }

  return message[0] ?? null;
}

/**
 * Field-level error message positioned out of flow so it does not change
 * field spacing or shift layout when it appears. Parent must be
 * `position: relative` (typically the field wrapper).
 */
export function FieldError({ id, message, className }: FieldErrorProps) {
  const text = resolveMessage(message);
  const hasError = text !== null;

  return (
    <p
      id={id}
      className={["field-error", className].filter(Boolean).join(" ")}
      role={hasError ? "alert" : undefined}
      aria-live="polite"
      aria-hidden={!hasError}
    >
      {text}
    </p>
  );
}
