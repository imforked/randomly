import {
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
  text?: string;
  visible?: boolean;
  onExitComplete?: () => void;
};

export function LoadingScreen({
  text = "Loading...",
  visible = true,
  onExitComplete,
}: LoadingScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const visibleRef = useRef(visible);
  const [entered, setEntered] = useState(false);

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
    if (reducedMotion && !visible && entered) {
      onExitComplete?.();
    }
  }, [reducedMotion, visible, entered, onExitComplete]);

  const isShown = entered && visible;

  const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.propertyName !== "opacity") {
      return;
    }

    if (!visibleRef.current) {
      onExitComplete?.();
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
        text={text}
        className="guide-prompt loading-screen__text"
        startImmediately
      />
    </main>
  );
}
