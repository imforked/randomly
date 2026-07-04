import { useEffect, useMemo, useRef, useState } from "react";
import type { RandomOption } from "src/api.types";

export const SELECTION_THANKS_MESSAGES = [
  "glad we could settle that for you.",
  "you're welcome for deciding.",
  "that's final. no takesies-backsies.",
  "hope everyone can live with that.",
  "case closed.",
  "problem solved. next.",
  "the judge has ruled.",
  "all sales final. no refunds.",
] as const;

export const pickSelectionThanksMessage = (seed: string) => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const messageIndex = hash % SELECTION_THANKS_MESSAGES.length;
  return SELECTION_THANKS_MESSAGES[messageIndex]!;
};

export const SELECTION_TIMING = {
  fadeMs: 500,
  optionFadeMs: 2000,
  preTopicPauseMs: 2000,
  topicHoldMs: 2500,
  resultHoldMs: 2500,
  thanksHoldMs: 5000,
} as const;

export const FADE_MS = SELECTION_TIMING.fadeMs;
export const OPTION_FADE_MS = SELECTION_TIMING.optionFadeMs;

export type SelectionPhase =
  | "idle"
  | "room-fade-out"
  | "pre-topic-pause"
  | "topic-fade-in"
  | "topic-hold"
  | "option-fade-in"
  | "result-hold"
  | "result-fade-out"
  | "thanks-fade-in"
  | "thanks"
  | "thanks-fade-out";

const REVEAL_PHASES = new Set<SelectionPhase>([
  "topic-fade-in",
  "topic-hold",
  "option-fade-in",
  "result-hold",
  "result-fade-out",
]);

const THANKS_PHASES = new Set<SelectionPhase>([
  "thanks-fade-in",
  "thanks",
  "thanks-fade-out",
]);

type UseSelectionExperienceParams = {
  selectedOption: RandomOption | null;
  selectionEpoch: number;
  reducedMotion: boolean;
  onThanksComplete?: () => void;
};

type SelectionTimings = {
  fadeMs: number;
  optionFadeMs: number;
  preTopicPauseMs: number;
  topicHoldMs: number;
  resultHoldMs: number;
  thanksHoldMs: number;
};

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getTimings(reducedMotion: boolean): SelectionTimings {
  if (reducedMotion) {
    return {
      fadeMs: 0,
      optionFadeMs: 0,
      preTopicPauseMs: 0,
      topicHoldMs: 0,
      resultHoldMs: 0,
      thanksHoldMs: 0,
    };
  }

  return { ...SELECTION_TIMING };
}

export function useSelectionExperience({
  selectedOption,
  selectionEpoch,
  reducedMotion,
  onThanksComplete,
}: UseSelectionExperienceParams) {
  const timings = useMemo(() => getTimings(reducedMotion), [reducedMotion]);

  const [phase, setPhase] = useState<SelectionPhase>("idle");
  const [randomOption, setRandomOption] = useState<RandomOption | null>(null);
  const [roomVisible, setRoomVisible] = useState(true);
  const [topicVisible, setTopicVisible] = useState(false);
  const [optionVisible, setOptionVisible] = useState(false);
  const [thanksVisible, setThanksVisible] = useState(false);

  const epochRef = useRef(selectionEpoch);
  const onThanksCompleteRef = useRef(onThanksComplete);
  onThanksCompleteRef.current = onThanksComplete;

  useEffect(() => {
    if (!selectedOption || selectionEpoch === 0) {
      return;
    }

    epochRef.current = selectionEpoch;
    const option = selectedOption;
    let cancelled = false;

    const shouldAbort = () =>
      cancelled || epochRef.current !== selectionEpoch;

    const pause = async (ms: number) => {
      await wait(ms);
      return !shouldAbort();
    };

    const fadeIn = async (
      setVisible: (visible: boolean) => void,
      durationMs: number
    ) => {
      setVisible(false);
      await nextFrame();
      if (shouldAbort()) {
        return false;
      }

      setVisible(true);
      return pause(durationMs);
    };

    const fadeOut = async (
      setVisible: (visible: boolean) => void,
      durationMs: number
    ) => {
      setVisible(false);
      return pause(durationMs);
    };

    const run = async () => {
      setRandomOption(option);

      setPhase("room-fade-out");
      setRoomVisible(true);
      await nextFrame();
      if (shouldAbort()) {
        return;
      }

      setRoomVisible(false);
      if (!(await pause(timings.fadeMs))) {
        return;
      }

      setPhase("pre-topic-pause");
      if (!(await pause(timings.preTopicPauseMs))) {
        return;
      }

      setPhase("topic-fade-in");
      if (!(await fadeIn(setTopicVisible, timings.fadeMs))) {
        return;
      }

      setPhase("topic-hold");
      if (!(await pause(timings.topicHoldMs))) {
        return;
      }

      setPhase("option-fade-in");
      if (!(await fadeIn(setOptionVisible, timings.optionFadeMs))) {
        return;
      }

      setPhase("result-hold");
      if (!(await pause(timings.resultHoldMs))) {
        return;
      }

      setPhase("result-fade-out");
      setTopicVisible(false);
      setOptionVisible(false);
      if (!(await pause(timings.fadeMs))) {
        return;
      }

      setPhase("thanks-fade-in");
      if (!(await fadeIn(setThanksVisible, timings.fadeMs))) {
        return;
      }

      setPhase("thanks");
      if (!(await pause(timings.thanksHoldMs))) {
        return;
      }

      setPhase("thanks-fade-out");
      if (!(await fadeOut(setThanksVisible, timings.fadeMs))) {
        return;
      }

      onThanksCompleteRef.current?.();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [selectedOption, selectionEpoch, timings]);

  const showRoomUI = phase === "idle" || phase === "room-fade-out";

  return {
    phase,
    randomOption,
    showRoomUI,
    roomVisible,
    showReveal: REVEAL_PHASES.has(phase),
    topicVisible,
    optionVisible,
    showThanks: THANKS_PHASES.has(phase),
    thanksVisible,
  };
}
