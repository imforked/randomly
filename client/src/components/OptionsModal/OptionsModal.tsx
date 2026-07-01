import { useCallback, useEffect } from "react";
import { OptionsForm } from "src/components/OptionsForm/OptionsForm";
import { useAnimatedModal } from "src/hooks/useAnimatedModal";
import { usePrefersReducedMotion } from "src/hooks/usePrefersReducedMotion";
import "./OptionsModal.css";

type OptionsModalProps = {
  open: boolean;
  onClose: () => void;
  optionsPerGuest: number;
  onSubmit: (options: string[]) => void | Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorDismiss?: () => void;
};

export function OptionsModal({
  open,
  onClose,
  optionsPerGuest,
  onSubmit,
  isSubmitting,
  errorMessage,
  onErrorDismiss,
}: OptionsModalProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { shouldMount, rootClass, panelRef, onPanelTransitionEnd } =
    useAnimatedModal(open, reducedMotion);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  if (!shouldMount) {
    return null;
  }

  return (
    <div className={rootClass}>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close dialog"
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className="modal-panel options-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Submit your options"
        tabIndex={-1}
        onTransitionEnd={onPanelTransitionEnd}
      >
        <button
          type="button"
          className="btn btn-secondary modal-close-btn"
          aria-label="Close"
          onClick={handleClose}
        >
          <svg
            className="modal-close-btn__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden={true}
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>
        <OptionsForm
          optionsPerGuest={optionsPerGuest}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onErrorDismiss={onErrorDismiss}
        />
      </div>
    </div>
  );
}
