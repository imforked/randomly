import { tryJoin, getOccupancy } from "../../services/presence.service.ts";
import { fetchRoomById, isRoomExpired } from "../../services/rooms.service.ts";
import {
  ClientPayload,
  REALTIME_ERROR_CODES,
  SERVER_EVENTS,
} from "../../types/realtime.ts";
import { getRoomId, getUserId } from "../parsePayload.ts";
import { addSocketToRoom, broadcastOccupancy } from "../roomSocket.ts";
import { sendError, send } from "../send.ts";
import {
  INVALID_MESSAGE_FORMAT,
  ROOM_NOT_FOUND,
} from "../../constants/errorMessages.ts";
import { WebSocket } from "ws";

export const handleJoin = async ({
  socket,
  socketId,
  payload,
}: {
  socket: WebSocket;
  socketId: string;
  payload: ClientPayload;
}) => {
  const roomId = getRoomId({ socket, payload });
  const userId = getUserId({ socket, payload });

  if (roomId === null) {
    return;
  }

  const room = await fetchRoomById(roomId);

  if (room === null) {
    sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.ROOM_NOT_FOUND,
      errorMessage: ROOM_NOT_FOUND,
    });

    return;
  }

  if (!room?.size) {
    sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
      errorMessage: INVALID_MESSAGE_FORMAT,
    });

    return;
  }

  const capacity = room.size;

  if (isRoomExpired(room)) {
    sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.ROOM_EXPIRED,
      errorMessage: "Room is expired.",
    });

    return;
  }

  if (userId === null) {
    return;
  }

  const join = tryJoin({
    roomId,
    userId,
    socketId,
    capacity,
  });

  if (!join.ok) {
    if (join.reason === "ALREADY_CONNECTED") {
      sendError({
        socket,
        errorType: REALTIME_ERROR_CODES.ALREADY_CONNECTED,
        errorMessage: "Already connected.",
      });

      return;
    }

    const occupancy = getOccupancy({ roomId, capacity });
    const {
      roomId: occupancyRoomId,
      capacity: occupancyCapacity,
      activeCount,
    } = occupancy;

    if (join.reason === "FULL") {
      send({
        socket,
        event: SERVER_EVENTS.FULL,
        payload: {
          roomId: occupancyRoomId,
          capacity: occupancyCapacity,
          activeCount,
        },
      });

      return;
    }
  }

  if (join.ok) {
    addSocketToRoom({ roomId, socket });

    send({
      socket,
      event: SERVER_EVENTS.JOINED,
      payload: {
        roomId,
        userId,
      },
    });

    const occupancy = getOccupancy({ roomId, capacity });

    broadcastOccupancy({ roomId, payload: occupancy });
  }
};
