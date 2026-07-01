import { useEffect, useState } from "react";
import type { RoomSubmission, RoomUser } from "src/api.types";
import { SERVER_EVENTS, type RoomErrorPayload, type RoomSubmissionsPayload, type RoomUsersPayload } from "src/realtime.types";
import { getWebSocketUrl } from "src/utils";

type UseRoomSocketParams = {
  roomId: string | undefined;
  userId: string | null;
  enabled: boolean;
  onInvalidUser?: () => void;
};

export function useRoomSocket({
  roomId,
  userId,
  enabled,
  onInvalidUser,
}: UseRoomSocketParams) {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [submissions, setSubmissions] = useState<RoomSubmission[]>([]);

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
        return;
      }

      if (parsed.event === SERVER_EVENTS.ERROR) {
        const { code, message: errorMessage } =
          parsed.payload as RoomErrorPayload;

        if (code === "INVALID_PAYLOAD" && errorMessage.includes("user")) {
          onInvalidUser?.();
        }

        console.error("Room socket error:", errorMessage);
      }
    };

    return () => {
      ws.close();
    };
  }, [enabled, roomId, userId, onInvalidUser]);

  return { users, submissions, setSubmissions };
}
