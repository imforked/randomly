import { useCallback, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from "src/components/FlippingLetterPool/FlippingLetterPool";
import { FieldError } from "src/components/FieldError/FieldError";
import { CyclingPlaceholderDial } from "src/components/CyclingPlaceholderDial/CyclingPlaceholderDial";
import { StartRoomModal } from "src/components/StartRoomModal/StartRoomModal";
import {
  OPTIONS_PER_GUEST_MAX as OPTIONS_MAX,
  OPTIONS_PER_GUEST_MIN as OPTIONS_MIN,
  ROOM_SIZE_MAX,
  ROOM_SIZE_MIN,
} from "@shared/roomConfigLimits.ts";
import "./CreateRoomPage.css";
import { z } from "zod";
import {
  CreateRoomSchema,
  MAX_CHARACTER_LIMIT,
  type FormError,
} from "./CreateRoomPage.schema";

const ROOM_SIZE_DEFAULT = 4;
const OPTIONS_DEFAULT = 3;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CREATE_ROOM_FLIP_LINES = [
  "what are you deciding on?",
  "how big is your room?",
  "how many options per guest?",
] as const;

const TOPIC_PLACEHOLDER_QUESTIONS = [
  "where are we hiking?",
  "who's on aux?",
  "where's brunch?",
  "what are we reading?",
  "what's the vibe tonight?",
  "where's the pregame?",
  "what's the move?",
  "what are we watching?",
  "where's happy hour?",
  "who's washing dishes?",
  "who's sleeping on the air mattress?",
  "who's driving?",
] as const;

const TOPIC_PLACEHOLDER_INTERVAL_MS = 2500;

export type RoomDraft = {
  topic: string;
  roomSize: number;
  optionsPerGuest: number;
};

type RoomConfigCreateBody = {
  topic: string;
  size: number;
  optionsPerGuest: number;
};

type CreatedRoomConfig = {
  id: string;
};

const createRoomConfig = async (
  roomConfig: RoomConfigCreateBody
): Promise<CreatedRoomConfig> => {
  const response = await fetch(`${API_BASE_URL}/api/rooms/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomConfig),
  });

  if (!response.ok) {
    throw new Error("failed to create room");
  }

  return response.json();
};

export function CreateRoomPage() {
  const decidingId = useId();
  const topicErrorId = useId();
  const roomSizeId = useId();
  const roomSizeErrorId = useId();
  const optionsId = useId();
  const optionsErrorId = useId();

  const [topic, setTopic] = useState("");
  const [roomSize, setRoomSize] = useState(ROOM_SIZE_DEFAULT);
  const [optionsPerGuest, setOptionsPerGuest] = useState(OPTIONS_DEFAULT);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [roomId, setRoomId] = useState<null | CreatedRoomConfig["id"]>(null);
  const [formErrors, setFormErrors] = useState<FormError>(null);

  const topicError = formErrors?.fieldErrors.topic;
  const sizeError = formErrors?.fieldErrors.size;
  const optionsPerGuestError = formErrors?.fieldErrors.optionsPerGuest;
  const hasTopicError = Boolean(topicError?.length);
  const hasSizeError = Boolean(sizeError?.length);
  const hasOptionsPerGuestError = Boolean(optionsPerGuestError?.length);

  const clearFormErrors = useCallback(() => {
    setFormErrors((current) => (current ? null : current));
  }, []);

  const submit = useCallback(async () => {
    const result = CreateRoomSchema.safeParse({
      topic,
      size: roomSize,
      optionsPerGuest,
    });

    if (!result.success) {
      setFormErrors(z.flattenError(result.error));
      return;
    }

    setFormErrors(null);

    const { id } = await createRoomConfig(result.data);

    setRoomId(id);
    setShareModalOpen(true);
  }, [optionsPerGuest, roomSize, topic]);

  return (
    <main className="shell shell-landing">
      <div className="stack-lg">
        <Link to="/" className="btn btn-secondary create-room-page__back">
          ← back
        </Link>
        <FlippingLetterPoolProvider lines={CREATE_ROOM_FLIP_LINES}>
          <form
            className="create-room-page__form"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <div className="create-room-page__field">
              <PooledFlippingTitle
                lineIndex={0}
                id={decidingId}
                as="h1"
                text={CREATE_ROOM_FLIP_LINES[0]}
                className="create-room-page__prompt"
              />
              <div className="create-room-page__topic-input">
                <input
                  type="text"
                  className={[
                    "field-input",
                    topic === "" && "field-input--empty",
                    hasTopicError ? "field-input--error" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    clearFormErrors();
                  }}
                  autoComplete="off"
                  aria-labelledby={decidingId}
                  aria-invalid={hasTopicError}
                  aria-describedby={hasTopicError ? topicErrorId : undefined}
                  maxLength={MAX_CHARACTER_LIMIT}
                />
                <CyclingPlaceholderDial
                  options={TOPIC_PLACEHOLDER_QUESTIONS}
                  intervalMs={TOPIC_PLACEHOLDER_INTERVAL_MS}
                  active={topic === ""}
                  className="create-room-page__topic-placeholder"
                />
              </div>
              <FieldError id={topicErrorId} message={topicError} />
            </div>

            <div className="create-room-page__field">
              <PooledFlippingTitle
                lineIndex={1}
                id={roomSizeId}
                as="h2"
                text={CREATE_ROOM_FLIP_LINES[1]}
                className="create-room-page__prompt"
              />
              <div
                className={[
                  "create-room-page__stepper",
                  hasSizeError ? "create-room-page__stepper--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="group"
                aria-labelledby={roomSizeId}
                aria-invalid={hasSizeError}
                aria-describedby={hasSizeError ? roomSizeErrorId : undefined}
              >
                <button
                  type="button"
                  className="btn btn-secondary create-room-page__stepper-btn"
                  aria-label="decrease room size"
                  disabled={roomSize <= ROOM_SIZE_MIN}
                  onClick={() => {
                    setRoomSize((n) => Math.max(ROOM_SIZE_MIN, n - 1));
                    clearFormErrors();
                  }}
                >
                  −
                </button>
                <span
                  className="create-room-page__stepper-value"
                  aria-live="polite"
                >
                  {roomSize}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary create-room-page__stepper-btn"
                  aria-label="increase room size"
                  disabled={roomSize >= ROOM_SIZE_MAX}
                  onClick={() => {
                    setRoomSize((n) => Math.min(ROOM_SIZE_MAX, n + 1));
                    clearFormErrors();
                  }}
                >
                  +
                </button>
              </div>
              <FieldError id={roomSizeErrorId} message={sizeError} />
            </div>

            <div className="create-room-page__field">
              <PooledFlippingTitle
                lineIndex={2}
                id={optionsId}
                as="h2"
                text={CREATE_ROOM_FLIP_LINES[2]}
                className="create-room-page__prompt"
              />
              <div
                className={[
                  "create-room-page__stepper",
                  hasOptionsPerGuestError
                    ? "create-room-page__stepper--error"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="group"
                aria-labelledby={optionsId}
                aria-invalid={hasOptionsPerGuestError}
                aria-describedby={
                  hasOptionsPerGuestError ? optionsErrorId : undefined
                }
              >
                <button
                  type="button"
                  className="btn btn-secondary create-room-page__stepper-btn"
                  aria-label="decrease options per guest"
                  disabled={optionsPerGuest <= OPTIONS_MIN}
                  onClick={() => {
                    setOptionsPerGuest((n) => Math.max(OPTIONS_MIN, n - 1));
                    clearFormErrors();
                  }}
                >
                  −
                </button>
                <span
                  className="create-room-page__stepper-value"
                  aria-live="polite"
                >
                  {optionsPerGuest}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary create-room-page__stepper-btn"
                  aria-label="increase options per guest"
                  disabled={optionsPerGuest >= OPTIONS_MAX}
                  onClick={() => {
                    setOptionsPerGuest((n) => Math.min(OPTIONS_MAX, n + 1));
                    clearFormErrors();
                  }}
                >
                  +
                </button>
              </div>
              <FieldError id={optionsErrorId} message={optionsPerGuestError} />
            </div>

            <button type="submit" className="btn create-room-page__submit">
              create a room
            </button>
          </form>
        </FlippingLetterPoolProvider>
      </div>
      <StartRoomModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        roomUrl={roomId ? `${window.location.origin}/rooms/${roomId}` : null}
      />
    </main>
  );
}
