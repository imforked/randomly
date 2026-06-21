import { RoomConfig } from "../generated/prisma/client.ts";
import { RoomOccupancyPayload } from "../types/realtime.ts";

const rooms = new Map<Pick<RoomConfig, "id">, Map<string, string>>();

const socketIndex = new Map<
  string,
  { roomId: Pick<RoomConfig, "id">; participantId: string }
>();

type JoinResult =
  | { ok: true }
  | { ok: false; reason: "ALREADY_CONNECTED" }
  | { ok: false; reason: "FULL" };

type LeaveByPayloadResult =
  | { ok: true; roomId: Pick<RoomConfig, "id">; participantId: string }
  | { ok: false; reason: "INVALID_PAYLOAD" }
  | { ok: false; reason: "NOOP" };

type LeaveBySocketResult =
  | { ok: true; roomId: Pick<RoomConfig, "id">; participantId: string }
  | { ok: false; reason: "NOOP" };

export const tryJoin = ({
  roomId,
  participantId,
  socketId,
  capacity,
}: {
  roomId: Pick<RoomConfig, "id">;
  participantId: string;
  socketId: string;
  capacity: number;
}): JoinResult => {
  let guestList = rooms.get(roomId);

  const socketForParticipant = guestList?.get(participantId);

  if (socketForParticipant) {
    return { ok: false, reason: "ALREADY_CONNECTED" };
  }

  if (!socketForParticipant) {
    const headCount = guestList ? guestList.size : 0;

    if (headCount >= capacity) {
      return { ok: false, reason: "FULL" };
    }
  }

  if (!guestList) {
    guestList = new Map();
    rooms.set(roomId, guestList);
  }

  guestList.set(participantId, socketId);
  socketIndex.set(socketId, { roomId, participantId });

  return { ok: true };
};

export const leaveByPayload = ({
  roomId,
  participantId,
  socketId,
}: {
  roomId: Pick<RoomConfig, "id">;
  participantId: string;
  socketId: string;
}): LeaveByPayloadResult => {
  const registered = socketIndex.get(socketId);

  if (!registered) {
    return { ok: false, reason: "NOOP" };
  }

  if (
    registered.roomId !== roomId ||
    registered.participantId !== participantId
  ) {
    return { ok: false, reason: "INVALID_PAYLOAD" };
  }

  const guestList = rooms.get(roomId);

  if (guestList) {
    guestList?.delete(participantId);

    if (guestList?.size === 0) {
      rooms.delete(roomId);
    }
  }

  socketIndex.delete(socketId);

  return { ok: true, roomId, participantId };
};

export const leaveBySocketId = ({
  socketId,
}: {
  socketId: string;
}): LeaveBySocketResult => {
  const registered = socketIndex.get(socketId);

  if (!registered) {
    return { ok: false, reason: "NOOP" };
  }

  const { roomId, participantId } = registered;

  const guestList = rooms.get(roomId);

  if (guestList) {
    guestList?.delete(participantId);

    if (guestList?.size === 0) {
      rooms.delete(roomId);
    }
  }

  socketIndex.delete(socketId);

  return { ok: true, roomId, participantId };
};

export const getOccupancy = ({
  roomId,
  capacity,
}: {
  roomId: Pick<RoomConfig, "id">;
  capacity: number;
}): RoomOccupancyPayload => {
  const guestList = rooms.get(roomId);

  const activeCount = guestList?.size ? guestList.size : 0;

  if (!guestList) {
    return {
      roomId,
      capacity,
      activeCount,
      spotsRemaining: capacity,
    };
  }

  const spotsRemaining = Math.max(capacity - activeCount, 0);

  return {
    roomId,
    capacity,
    activeCount,
    spotsRemaining,
  };
};
