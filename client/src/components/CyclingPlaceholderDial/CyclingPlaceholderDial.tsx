import { useCallback, useEffect, useState, type AnimationEvent } from "react";
import { usePrefersReducedMotion } from "src/hooks/usePrefersReducedMotion";
import "./CyclingPlaceholderDial.css";

const DIAL_ANIMATION_MS = 450;

type CyclingPlaceholderDialProps = {
  options: readonly string[];
  intervalMs: number;
  active?: boolean;
  className?: string;
};

export function CyclingPlaceholderDial({
  options,
  intervalMs,
  active = true,
  className,
}: CyclingPlaceholderDialProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const advance = useCallback(() => {
    setCurrentIndex((index) => {
      if (!reducedMotion) {
        setPreviousIndex(index);
        setIsAnimating(true);
      }
      return (index + 1) % options.length;
    });
  }, [options.length, reducedMotion]);

  useEffect(() => {
    if (!active || options.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(advance, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [active, advance, intervalMs, options.length]);

  useEffect(() => {
    if (active) {
      return;
    }

    setPreviousIndex(null);
    setIsAnimating(false);
  }, [active]);

  useEffect(() => {
    if (!isAnimating) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsAnimating(false);
      setPreviousIndex(null);
    }, DIAL_ANIMATION_MS + 100);

    return () => window.clearTimeout(timeoutId);
  }, [currentIndex, isAnimating]);

  useEffect(() => {
    const resetAnimationState = () => {
      setIsAnimating(false);
      setPreviousIndex(null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetAnimationState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleAnimationEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.animationName !== "cycling-placeholder-dial-in") {
      return;
    }

    setIsAnimating(false);
    setPreviousIndex(null);
  };

  if (!active || options.length === 0) {
    return null;
  }

  const showTransition =
    !reducedMotion && isAnimating && previousIndex !== null;

  return (
    <span
      className={["cycling-placeholder-dial", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={true}
    >
      <span className="cycling-placeholder-dial__viewport">
        {showTransition ? (
          <span className="cycling-placeholder-dial__line cycling-placeholder-dial__line--out">
            {options[previousIndex]}
          </span>
        ) : null}
        <span
          className={[
            "cycling-placeholder-dial__line",
            showTransition ? "cycling-placeholder-dial__line--in" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onAnimationEnd={showTransition ? handleAnimationEnd : undefined}
        >
          {options[currentIndex]}
        </span>
      </span>
    </span>
  );
}
