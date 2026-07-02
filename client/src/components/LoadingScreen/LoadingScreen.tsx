import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import { FlippingText } from "src/components/FlippingLetterPool/FlippingText";
import { usePrefersReducedMotion } from "src/hooks/usePrefersReducedMotion";
import "./LoadingScreen.css";

type LoadingScreenProps = {
  visible?: boolean;
  onExitComplete?: () => void;
};

export function LoadingScreen({
  visible = true,
  onExitComplete,
}: LoadingScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const visibleRef = useRef(visible);
  const exitNotifiedRef = useRef(false);
  const [entered, setEntered] = useState(false);

  const notifyExit = useCallback(() => {
    if (exitNotifiedRef.current) {
      return;
    }

    exitNotifiedRef.current = true;
    onExitComplete?.();
  }, [onExitComplete]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });

    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (visible) {
      exitNotifiedRef.current = false;
      return;
    }

    if (!entered || reducedMotion) {
      notifyExit();
    }
  }, [visible, entered, reducedMotion, notifyExit]);

  const isShown = entered && visible;

  const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.propertyName !== "opacity") {
      return;
    }

    if (!visibleRef.current) {
      notifyExit();
    }
  };

  return (
    <main
      className={[
        "shell",
        "shell-landing",
        "loading-screen",
        isShown ? "loading-screen--visible" : "",
        reducedMotion ? "loading-screen--reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onTransitionEnd={handleTransitionEnd}
    >
      <FlippingText
        as="h1"
        text="Loading"
        staticSuffix="..."
        className="guide-prompt loading-screen__text"
        startImmediately
      />
    </main>
  );
}
