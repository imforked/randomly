import { RoomId, REALTIME_ERROR_CODES, SERVER_EVENTS } from "../../types/realtime.ts";
import { leaveByPayload } from "../../services/presence.service.ts";
import { fetchRoomById } from "../../services/rooms.service.ts";
import { removeSocketFromRoom } from "../roomSocket.ts";
import { sendError, send } from "../send.ts";
import { INVALID_MESSAGE_FORMAT } from "../../constants/errorMessages.ts";
import { WebSocket } from "ws";

export const handleLeave = async ({
  socket,
  socketId,
  roomId,
  participantId,
}: {
  socket: WebSocket;
  socketId: string;
  roomId: RoomId;
  participantId: string;
}) => {
  const leave = leaveByPayload({ roomId, participantId, socketId });

  if (!leave.ok && leave.reason === "NOOP") {
    return;
  }

  if (!leave.ok && leave.reason === "INVALID_PAYLOAD") {
    sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
      errorMessage: INVALID_MESSAGE_FORMAT,
    });

    return;
  }

  const room = await fetchRoomById(roomId);

  if (!room?.size) {
    sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
      errorMessage: INVALID_MESSAGE_FORMAT,
    });

    return;
  }

  if (leave.ok) {
    send({
      socket,
      event: SERVER_EVENTS.LEFT,
      payload: {
        roomId,
        participantId,
      },
    });

    removeSocketFromRoom({ roomId, socket, room });
  }
};
