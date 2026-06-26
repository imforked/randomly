import { RoomConfig } from "../generated/prisma/client.ts";
import {
  RoomId,
  RoomOccupancyPayload,
  RoomUsersPayload,
  SERVER_EVENTS,
} from "../types/realtime.ts";
import { send } from "./send.ts";
import { getOccupancy } from "../services/presence.service.ts";
import { WebSocket } from "ws";

const roomSockets = new Map<string, Set<WebSocket>>();

export const addSocketToRoom = ({
  roomId,
  socket,
}: {
  roomId: RoomId;
  socket: WebSocket;
}) => {
  let socketsInRoom = roomSockets.get(roomId.id);
  if (!socketsInRoom) {
    socketsInRoom = new Set<WebSocket>();
    roomSockets.set(roomId.id, socketsInRoom);
  }
  socketsInRoom.add(socket);
};

export const broadcastOccupancy = ({
  roomId,
  payload,
}: {
  roomId: RoomId;
  payload: RoomOccupancyPayload;
}) => {
  const socketsInRoom = roomSockets.get(roomId.id);

  if (!socketsInRoom) {
    return;
  }

  for (const clientSocket of socketsInRoom) {
    send({
      socket: clientSocket,
      event: SERVER_EVENTS.OCCUPANCY,
      payload,
    });
  }
};

export const broadcastUsers = ({
  roomId,
  payload,
}: {
  roomId: RoomId;
  payload: RoomUsersPayload;
}) => {
  const socketsInRoom = roomSockets.get(roomId.id);

  if (!socketsInRoom) {
    return;
  }

  for (const clientSocket of socketsInRoom) {
    send({
      socket: clientSocket,
      event: SERVER_EVENTS.USERS,
      payload,
    });
  }
};

export const removeSocketFromRoom = ({
  roomId,
  socket,
  room,
}: {
  roomId: RoomId;
  socket: WebSocket;
  room: RoomConfig;
}) => {
  const socketsInRoom = roomSockets.get(roomId.id);

  const occupancy = getOccupancy({ roomId, capacity: room.size });

  if (!socketsInRoom) {
    return;
  }

  socketsInRoom.delete(socket);

  broadcastOccupancy({ roomId, payload: occupancy });

  if (occupancy.spotsRemaining === 0) {
    roomSockets.delete(roomId.id);
  }
};
