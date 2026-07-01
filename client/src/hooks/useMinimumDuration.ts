import { useCallback, useRef } from "react";

export function useMinimumDuration(minMs: number) {
  const startedAtRef = useRef(Date.now());

  const waitForRemaining = useCallback(async () => {
    const remaining = Math.max(0, minMs - (Date.now() - startedAtRef.current));

    if (remaining === 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, remaining);
    });
  }, [minMs]);

  return waitForRemaining;
}
