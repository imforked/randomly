import { useMemo, useState } from "react";
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from "src/components/FlippingLetterPool/FlippingLetterPool";
import { OptionsModal } from "src/components/OptionsModal/OptionsModal";
import type { RoomConfig, RoomSubmission, RoomUser } from "src/api.types";
import "./RoomExperience.css";

type RoomExperienceProps = {
  room: RoomConfig;
  userId: string;
  users: RoomUser[];
  submissions: RoomSubmission[];
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
  onSubmitOptions,
  isSubmittingOptions,
  optionsErrorMessage,
  onOptionsErrorDismiss,
}: RoomExperienceProps) {
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const topicLines = useMemo(() => [room.topic] as const, [room.topic]);
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
    return submission?.hasSubmitted ? "Submitted" : "waiting for submission";
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
    <main className="shell shell-landing">
      <div className="stack-lg room-experience">
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
            You&apos;ve submitted.
          </p>
        ) : (
          <button
            type="button"
            className="btn room-experience__options-btn"
            onClick={() => setOptionsModalOpen(true)}
          >
            Add your options
          </button>
        )}

        {room.size > 1 ? (
          <section
            className="room-experience__section"
            aria-label={
              waitingForOthersLabel
                ? `Guests ${waitingForOthersLabel}`
                : "Guests"
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
              <p className="room-experience__empty text-body">No guests yet.</p>
            ) : (
              <ul className="room-experience__guest-list">
                {users.map((user) => (
                  <li key={user.id} className="room-experience__guest">
                    <span className="room-experience__guest-name">{user.name}</span>
                    <span
                      className={[
                        "room-experience__guest-status",
                        getSubmissionStatus(user.id) === "Submitted"
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

      <OptionsModal
        open={optionsModalOpen}
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
