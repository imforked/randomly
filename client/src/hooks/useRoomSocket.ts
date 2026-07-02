import { useEffect, useRef, useState } from "react";
import type { RandomOption, RoomSubmission, RoomUser } from "src/api.types";
import {
  SERVER_EVENTS,
  type RoomErrorPayload,
  type RoomSelectionPayload,
  type RoomSubmissionsPayload,
  type RoomUsersPayload,
} from "src/realtime.types";
import { getWebSocketUrl } from "src/utils";

type UseRoomSocketParams = {
  roomId: string | undefined;
  userId: string | null;
  enabled: boolean;
  onInvalidUser?: () => void;
  onSelection?: (option: RandomOption) => void;
  onSubmissions?: (submissions: RoomSubmission[]) => void;
};

export function useRoomSocket({
  roomId,
  userId,
  enabled,
  onInvalidUser,
  onSelection,
  onSubmissions,
}: UseRoomSocketParams) {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [submissions, setSubmissions] = useState<RoomSubmission[]>([]);

  const onInvalidUserRef = useRef(onInvalidUser);
  const onSelectionRef = useRef(onSelection);
  const onSubmissionsRef = useRef(onSubmissions);
  onInvalidUserRef.current = onInvalidUser;
  onSelectionRef.current = onSelection;
  onSubmissionsRef.current = onSubmissions;

  useEffect(() => {
    if (!enabled || !roomId || !userId) {
      return;
    }

    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: "room:join",
          payload: { roomId, userId },
        })
      );
    };

    ws.onmessage = (event) => {
      let parsed: { event: string; payload: unknown };

      try {
        parsed = JSON.parse(event.data) as { event: string; payload: unknown };
      } catch {
        console.error("Invalid websocket message.");
        return;
      }

      if (parsed.event === SERVER_EVENTS.USERS) {
        const payload = parsed.payload as RoomUsersPayload;
        setUsers(payload.users);
        return;
      }

      if (parsed.event === SERVER_EVENTS.SUBMISSIONS) {
        const payload = parsed.payload as RoomSubmissionsPayload;
        setSubmissions(payload.submissions);
        onSubmissionsRef.current?.(payload.submissions);
        return;
      }

      if (parsed.event === SERVER_EVENTS.SELECTION) {
        const payload = parsed.payload as RoomSelectionPayload;
        onSelectionRef.current?.(payload.option);
        return;
      }

      if (parsed.event === SERVER_EVENTS.ERROR) {
        const { code, message: errorMessage } =
          parsed.payload as RoomErrorPayload;

        if (code === "INVALID_PAYLOAD" && errorMessage.includes("user")) {
          onInvalidUserRef.current?.();
        }

        console.error("Room socket error:", errorMessage);
      }
    };

    return () => {
      ws.close();
    };
  }, [enabled, roomId, userId]);

  return { users, submissions, setSubmissions };
}
