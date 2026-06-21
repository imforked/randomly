import { leaveBySocketId } from "../../services/presence.service.ts";
import { fetchRoomById } from "../../services/rooms.service.ts";
import { removeSocketFromRoom } from "../roomSocket.ts";
import { WebSocket } from "ws";

export const handleDisconnect = async ({
  socket,
  socketId,
  connections,
}: {
  socketId: string;
  socket: WebSocket;
  connections: Map<string, WebSocket>;
}) => {
  const leave = leaveBySocketId({ socketId });

  if (!leave.ok) {
    connections.delete(socketId);
    return;
  }

  const { roomId } = leave;

  const room = await fetchRoomById(roomId);

  if (!room?.size) {
    connections.delete(socketId);
    return;
  }

  removeSocketFromRoom({ roomId, socket, room });

  connections.delete(socketId);
};
