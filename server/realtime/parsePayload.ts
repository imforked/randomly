import { ClientPayload, REALTIME_ERROR_CODES, RoomId } from "../types/realtime.ts";
import { sendError } from "./send.ts";
import { WebSocket } from "ws";
import { INVALID_MESSAGE_FORMAT } from "../constants/errorMessages.ts";

export const getRoomId = ({
  socket,
  payload,
}: {
  socket: WebSocket;
  payload: ClientPayload;
}): RoomId | null => {
  if (typeof payload?.roomId !== "string") {
    sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
      errorMessage: INVALID_MESSAGE_FORMAT,
    });

    return null;
  }

  return { id: payload.roomId };
};

export const getUserId = ({
  socket,
  payload,
}: {
  socket: WebSocket;
  payload: ClientPayload;
}): string | null => {
  if (typeof payload?.userId !== "string") {
    sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
      errorMessage: INVALID_MESSAGE_FORMAT,
    });

    return null;
  }

  return payload.userId;
};
