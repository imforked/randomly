import { tryJoin, getOccupancy } from "../../services/presence.service.ts";
import { fetchRoomById, isRoomExpired } from "../../services/rooms.service.ts";
import {
  ClientPayload,
  REALTIME_ERROR_CODES,
  SERVER_EVENTS,
} from "../../types/realtime.ts";
import { getRoomId, getUserId } from "../parsePayload.ts";
import {
  addSocketToRoom,
  broadcastOccupancy,
  broadcastUsers,
} from "../roomSocket.ts";
import { sendError, send } from "../send.ts";
import {
  INVALID_MESSAGE_FORMAT,
  ROOM_NOT_FOUND,
} from "../../constants/errorMessages.ts";
import { WebSocket } from "ws";
import { getUserInRoom, getUsersInRoom } from "../../services/user.service.ts";
import { getSelectedOption } from "../../services/options.service.ts";
import { toSelectionPayload } from "../../services/selection.service.ts";

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

  if (!userId) {
    return sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
      errorMessage: "Invalid userId",
    });
  }

  const user = await getUserInRoom({ userId, roomId: roomId.id });

  if (!user) {
    return sendError({
      socket,
      errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
      errorMessage: "Invalid userId",
    });
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
        user: {
          id: user.id,
          name: user.name,
        },
      },
    });

    const occupancy = getOccupancy({ roomId, capacity });

    broadcastOccupancy({ roomId, payload: occupancy });

    const users = await getUsersInRoom({ roomId: roomId.id });
    const normalizedUsers = users.map(({ id, name }) => ({ id, name }));

    broadcastUsers({
      roomId,
      payload: {
        roomId,
        users: normalizedUsers,
      },
    });

    const selectedOption = await getSelectedOption({ roomId: roomId.id });

    if (selectedOption) {
      send({
        socket,
        event: SERVER_EVENTS.SELECTION,
        payload: {
          roomId,
          option: toSelectionPayload(selectedOption),
        },
      });
    }
  }
};
