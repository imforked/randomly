import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from "src/components/FlippingLetterPool/FlippingLetterPool";
import { OptionsModal } from "src/components/OptionsModal/OptionsModal";
import {
  FADE_MS,
  OPTION_FADE_MS,
  SELECTION_THANKS_TEXT,
  useSelectionExperience,
} from "src/hooks/useSelectionExperience";
import { usePrefersReducedMotion } from "src/hooks/usePrefersReducedMotion";
import type { RandomOption, RoomConfig, RoomSubmission, RoomUser } from "src/api.types";
import { isRoomReadyForSelection } from "src/utils";
import "./RoomExperience.css";

const THANKS_LINES = [SELECTION_THANKS_TEXT] as const;
const THANKS_STATIC_CHARS = [["."]] as const;

function joinClasses(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function fadeTargetClassName(visible: boolean, ...extra: string[]) {
  return joinClasses(
    "selection-experience__fade-target",
    ...extra,
    visible && "selection-experience__fade-target--visible"
  );
}

const selectionTimingStyle = {
  "--selection-fade-ms": `${FADE_MS}ms`,
  "--selection-option-fade-ms": `${OPTION_FADE_MS}ms`,
} as CSSProperties;

type RoomExperienceProps = {
  room: RoomConfig;
  userId: string;
  users: RoomUser[];
  submissions: RoomSubmission[];
  selectedOption: RandomOption | null;
  selectionEpoch: number;
  onRequestSelection: () => void | Promise<void>;
  onThanksComplete?: () => void;
  onSubmitOptions: (options: string[]) => void | Promise<void>;
  isSubmittingOptions: boolean;
  optionsErrorMessage: string | null;
  onOptionsErrorDismiss?: () => void;
};

export function RoomExperience({
  room,
  userId,
  users,
  submissions,
  selectedOption,
  selectionEpoch,
  onRequestSelection,
  onThanksComplete,
  onSubmitOptions,
  isSubmittingOptions,
  optionsErrorMessage,
  onOptionsErrorDismiss,
}: RoomExperienceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const topicLines = useMemo(() => [room.topic] as const, [room.topic]);

  const allSubmitted = useMemo(
    () => isRoomReadyForSelection({ submissions, roomSize: room.size }),
    [submissions, room.size]
  );

  const selection = useSelectionExperience({
    selectedOption,
    selectionEpoch,
    reducedMotion,
    onThanksComplete,
  });

  const revealLines = useMemo(
    () => [room.topic, selection.randomOption?.value ?? ""] as const,
    [room.topic, selection.randomOption?.value]
  );

  useEffect(() => {
    if (allSubmitted || selectionEpoch > 0) {
      setOptionsModalOpen(false);
    }
  }, [allSubmitted, selectionEpoch]);

  useEffect(() => {
    if (!allSubmitted || selectedOption) {
      return;
    }

    void onRequestSelection();
  }, [allSubmitted, selectedOption, onRequestSelection]);

  const currentUserHasSubmitted = submissions.some(
    (submission) => submission.id === userId && submission.hasSubmitted
  );

  const othersWaitingToJoinCount = useMemo(() => {
    return Math.max(0, room.size - users.length);
  }, [room.size, users.length]);

  const waitingForOthersLabel = useMemo(() => {
    if (othersWaitingToJoinCount === 0) {
      return null;
    }

    const noun = othersWaitingToJoinCount === 1 ? "other" : "others";
    return `(waiting for ${othersWaitingToJoinCount} ${noun})`;
  }, [othersWaitingToJoinCount]);

  const getSubmissionStatus = (id: string) => {
    const submission = submissions.find((entry) => entry.id === id);
    return submission?.hasSubmitted ? "submitted" : "waiting for submission";
  };

  const handleSubmitOptions = async (options: string[]) => {
    try {
      await onSubmitOptions(options);
      setOptionsModalOpen(false);
    } catch {
      // Keep the modal open so the user can fix and retry.
    }
  };

  return (
    <main
      className={joinClasses(
        "shell",
        "shell-landing",
        "selection-experience",
        reducedMotion && "selection-experience--reduced-motion"
      )}
      style={selectionTimingStyle}
    >
      {selection.showRoomUI ? (
        <div
          className={joinClasses(
            "selection-experience__layer",
            "selection-experience__room",
            "stack-lg",
            "room-experience",
            selection.roomVisible && "selection-experience__layer--visible"
          )}
        >
          <FlippingLetterPoolProvider lines={topicLines}>
            <PooledFlippingTitle
              lineIndex={0}
              as="h1"
              text={room.topic}
              className="room-experience__topic"
            />
          </FlippingLetterPoolProvider>

          {currentUserHasSubmitted ? (
            <p className="room-experience__submitted-message text-body">
              you&apos;ve submitted.
            </p>
          ) : (
            <button
              type="button"
              className="btn room-experience__options-btn"
              onClick={() => setOptionsModalOpen(true)}
            >
              add your options
            </button>
          )}

          {room.size > 1 ? (
            <section
              className="room-experience__section"
              aria-label={
                waitingForOthersLabel
                  ? `guests ${waitingForOthersLabel}`
                  : "guests"
              }
            >
              <h2 className="room-experience__section-title">
                who&apos;s here
                {waitingForOthersLabel ? (
                  <span className="room-experience__section-note">
                    {" "}
                    {waitingForOthersLabel}
                  </span>
                ) : null}
              </h2>
              {users.length === 0 ? (
                <p className="room-experience__empty text-body">no guests yet.</p>
              ) : (
                <ul className="room-experience__guest-list">
                  {users.map((user) => (
                    <li key={user.id} className="room-experience__guest">
                      <span className="room-experience__guest-name">
                        {user.name}
                      </span>
                      <span
                        className={[
                          "room-experience__guest-status",
                          getSubmissionStatus(user.id) === "submitted"
                            ? "room-experience__guest-status--submitted"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {getSubmissionStatus(user.id)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      ) : null}

      {selection.showReveal && selection.randomOption ? (
        <div
          className="selection-experience__layer selection-experience__reveal selection-experience__layer--visible"
          aria-live="polite"
        >
          <FlippingLetterPoolProvider lines={revealLines}>
            <PooledFlippingTitle
              lineIndex={0}
              as="h1"
              text={room.topic}
              className={fadeTargetClassName(
                selection.topicVisible,
                "selection-experience__topic"
              )}
            />
            <PooledFlippingTitle
              lineIndex={1}
              as="h2"
              text={selection.randomOption.value}
              className={fadeTargetClassName(
                selection.optionVisible,
                "selection-experience__option"
              )}
            />
          </FlippingLetterPoolProvider>
        </div>
      ) : null}

      {selection.showThanks ? (
        <div
          className={joinClasses(
            "selection-experience__layer",
            "selection-experience__thanks",
            selection.thanksVisible && "selection-experience__layer--visible"
          )}
        >
          <FlippingLetterPoolProvider
            lines={THANKS_LINES}
            staticCharsByLine={THANKS_STATIC_CHARS}
          >
            <PooledFlippingTitle
              lineIndex={0}
              as="p"
              text={SELECTION_THANKS_TEXT}
              className="selection-experience__thanks-text"
            />
          </FlippingLetterPoolProvider>
        </div>
      ) : null}

      <OptionsModal
        open={optionsModalOpen && !allSubmitted}
        onClose={() => setOptionsModalOpen(false)}
        optionsPerGuest={room.optionsPerGuest}
        onSubmit={handleSubmitOptions}
        isSubmitting={isSubmittingOptions}
        errorMessage={optionsErrorMessage}
        onErrorDismiss={onOptionsErrorDismiss}
      />
    </main>
  );
}
