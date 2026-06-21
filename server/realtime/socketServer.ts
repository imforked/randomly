import { Server, ServerResponse } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import {
  SERVER_EVENTS,
  REALTIME_ERROR_CODES,
  CLIENT_EVENTS,
  Payload,
  RoomJoinPayload,
  RoomLeavePayload,
} from "../types/realtime.ts";
import { fetchRoomById, isRoomExpired } from "../services/rooms.service.ts";
import {
  tryJoin,
  getOccupancy,
  leaveByPayload,
  leaveBySocketId,
} from "../services/presence.service.ts";
import { RoomConfig } from "../generated/prisma/client.ts";

const send = ({
  socket,
  event,
  payload,
}: {
  socket: WebSocket;
  event: SERVER_EVENTS;
  payload: Payload;
}) => {
  socket.send(JSON.stringify({ event, payload }));
  return;
};

const connections = new Map();
const roomSockets: Map<Pick<RoomConfig, "id">, Set<WebSocket>> = new Map();

const INVALID_MESSAGE_FORMAT = "Invalid message format.";
const ROOM_NOT_FOUND = "Room not found.";

const getRoomId = ({
  socket,
  payload,
}: {
  socket: WebSocket;
  payload: any;
}): Pick<RoomConfig, "id"> | null => {
  if (typeof payload?.roomId !== "string") {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
        message: INVALID_MESSAGE_FORMAT,
      },
    });

    return null;
  }

  return payload.roomId;
};

const getParticipantId = ({
  socket,
  payload,
}: {
  socket: WebSocket;
  payload: any;
}) => {
  if (typeof payload?.participantId !== "string") {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
        message: INVALID_MESSAGE_FORMAT,
      },
    });

    return null;
  }

  return payload.participantId;
};

const handleJoin = async ({
  socket,
  socketId,
  payload,
}: {
  socket: WebSocket;
  socketId: string;
  payload: RoomJoinPayload;
}) => {
  const roomId = getRoomId({ socket, payload });
  const participantId = await getParticipantId({ socket, payload });

  if (roomId === null) {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.ROOM_NOT_FOUND,
        message: ROOM_NOT_FOUND,
      },
    });

    console.error(ROOM_NOT_FOUND);

    return;
  }

  const room = await fetchRoomById(roomId);

  if (room === null) {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.ROOM_NOT_FOUND,
        message: ROOM_NOT_FOUND,
      },
    });

    console.error(ROOM_NOT_FOUND);

    return;
  }

  if (!room?.size) {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
        message: INVALID_MESSAGE_FORMAT,
      },
    });

    console.error(ROOM_NOT_FOUND);

    return;
  }

  const capacity = room.size;

  if (isRoomExpired(room)) {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.ROOM_EXPIRED,
        message: "Room is expired.",
      },
    });

    return;
  }

  const join = tryJoin({
    roomId,
    participantId,
    socketId,
    capacity,
  });

  if (!join.ok) {
    if (join.reason === "ALREADY_CONNECTED") {
      send({
        socket,
        event: SERVER_EVENTS.ERROR,
        payload: {
          code: REALTIME_ERROR_CODES.ALREADY_CONNECTED,
          message: "Already connected.",
        },
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
    let socketsInRoom = roomSockets.get(roomId);

    // if there aren't sockets, add a new set
    if (!socketsInRoom) {
      socketsInRoom = new Set<WebSocket>();
      roomSockets.set(roomId, socketsInRoom);
    }
    // add a socket
    socketsInRoom.add(socket);

    // emit room:joined
    send({
      socket,
      event: SERVER_EVENTS.JOINED,
      payload: {
        roomId,
        participantId,
      },
    });

    const occupancy = getOccupancy({ roomId, capacity });

    // emit room:occupancy event to all users
    for (const clientSocket of socketsInRoom) {
      send({
        socket: clientSocket,
        event: SERVER_EVENTS.OCCUPANCY,
        payload: occupancy,
      });
    }
  }
};

const handleLeave = async ({
  socket,
  socketId,
  payload,
}: {
  socket: WebSocket;
  socketId: string;
  payload: RoomLeavePayload;
}) => {
  const roomId = getRoomId({ socket, payload });
  const participantId = getParticipantId({ socket, payload });

  if (roomId === null) {
    console.error(ROOM_NOT_FOUND);

    return;
  }

  if (participantId === null) {
    console.error(ROOM_NOT_FOUND);

    return;
  }

  const leave = leaveByPayload({ roomId, participantId, socketId });

  if (!leave.ok && leave.reason === "NOOP") {
    return;
  }

  if (!leave.ok && leave.reason === "INVALID_PAYLOAD") {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
        message: INVALID_MESSAGE_FORMAT,
      },
    });

    return;
  }

  const room = await fetchRoomById(roomId);

  if (!room?.size) {
    send({
      socket,
      event: SERVER_EVENTS.ERROR,
      payload: {
        code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
        message: INVALID_MESSAGE_FORMAT,
      },
    });

    return;
  }
  const { size } = room;

  const occupancy = getOccupancy({ roomId, capacity: size });

  if (leave.ok) {
    let socketsInRoom = roomSockets.get(roomId);

    if (socketsInRoom) {
      socketsInRoom.delete(socket);
    }

    send({
      socket,
      event: SERVER_EVENTS.LEFT,
      payload: {
        roomId,
        participantId,
      },
    });

    if (!socketsInRoom) {
      return;
    }

    for (const clientSocket of socketsInRoom) {
      send({
        socket: clientSocket,
        event: SERVER_EVENTS.OCCUPANCY,
        payload: occupancy,
      });
    }

    if (occupancy.spotsRemaining === 0) {
      roomSockets.delete(roomId);
    }
  }
};

export const attachSocketServer = (server: Server) => {
  const webSocketServer = new WebSocketServer({ server });

  webSocketServer.addListener("connection", (socket) => {
    const socketId = crypto.randomUUID();
    connections.set(socketId, socket);

    socket.on("message", (raw) => {
      const stringifiedMessage = raw.toString();

      let parsedMessage;

      try {
        parsedMessage = JSON.parse(stringifiedMessage);
      } catch {
        send({
          socket,
          event: SERVER_EVENTS.ERROR,
          payload: {
            code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
            message: "Invalid message format",
          },
        });
        console.error(REALTIME_ERROR_CODES.INVALID_PAYLOAD);
        return;
      }

      if (typeof parsedMessage?.event !== "string") {
        return send({
          socket,
          event: SERVER_EVENTS.ERROR,
          payload: {
            code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
            message: INVALID_MESSAGE_FORMAT,
          },
        });
      }

      if (
        parsedMessage?.payload === null ||
        parsedMessage?.payload === undefined
      ) {
        return send({
          socket,
          event: SERVER_EVENTS.ERROR,
          payload: {
            code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
            message: INVALID_MESSAGE_FORMAT,
          },
        });
      }

      const { event, payload } = parsedMessage;

      if (event === CLIENT_EVENTS.JOIN) {
        console.log("join", payload, socketId);

        handleJoin({ socket, socketId, payload });

        return;
      }

      if (event === CLIENT_EVENTS.LEAVE) {
        const roomId = getRoomId({ socket, payload });
        const participantId = getParticipantId({ socket, payload });

        if (roomId === null) {
          return;
        }

        if (participantId === null) {
          return;
        }

        handleLeave({
          socket,
          socketId,
          payload: {
            roomId,
            participantId,
          },
        });

        return;
      }

      return send({
        socket,
        event: SERVER_EVENTS.ERROR,
        payload: {
          code: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
          message: INVALID_MESSAGE_FORMAT,
        },
      });
    });

    socket.on("close", async () => {
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

      const occupancy = getOccupancy({ roomId, capacity: room.size });

      const socketsInRoom = roomSockets.get(roomId);

      if (socketsInRoom) {
        socketsInRoom.delete(socket);
      }

      if (socketsInRoom) {
        for (const clientSocket of socketsInRoom) {
          send({
            socket: clientSocket,
            event: SERVER_EVENTS.OCCUPANCY,
            payload: occupancy,
          });
        }
      }

      if (occupancy.spotsRemaining === 0) {
        roomSockets.delete(roomId);
      }

      connections.delete(socketId);
    });
  });
};
