import { RoomOccupancyPayload, RoomId } from "../types/realtime.ts";

const rooms = new Map<string, Map<string, string>>();

const socketIndex = new Map<
  string,
  { roomId: RoomId; userId: string }
>();

type JoinResult =
  | { ok: true; reconnected?: boolean }
  | { ok: false; reason: "FULL" };

type LeaveByPayloadResult =
  | { ok: true; roomId: RoomId; userId: string }
  | { ok: false; reason: "INVALID_PAYLOAD" }
  | { ok: false; reason: "NOOP" };

type LeaveBySocketResult =
  | { ok: true; roomId: RoomId; userId: string }
  | { ok: false; reason: "NOOP" };

export const tryJoin = ({
  roomId,
  userId,
  socketId,
  capacity,
}: {
  roomId: RoomId;
  userId: string;
  socketId: string;
  capacity: number;
}): JoinResult => {
  let guestList = rooms.get(roomId.id);

  const previousSocketId = guestList?.get(userId);

  if (previousSocketId) {
    socketIndex.delete(previousSocketId);
    guestList.set(userId, socketId);
    socketIndex.set(socketId, { roomId, userId });
    return { ok: true, reconnected: true };
  }

  if (!guestList) {
    guestList = new Map();
    rooms.set(roomId.id, guestList);
  }

  const headCount = guestList.size;

  if (headCount >= capacity) {
    return { ok: false, reason: "FULL" };
  }

  guestList.set(userId, socketId);
  socketIndex.set(socketId, { roomId, userId });

  return { ok: true };
};

export const leaveByPayload = ({
  roomId,
  userId,
  socketId,
}: {
  roomId: RoomId;
  userId: string;
  socketId: string;
}): LeaveByPayloadResult => {
  const registered = socketIndex.get(socketId);

  if (!registered) {
    return { ok: false, reason: "NOOP" };
  }

  if (
    registered.roomId.id !== roomId.id ||
    registered.userId !== userId
  ) {
    return { ok: false, reason: "INVALID_PAYLOAD" };
  }

  const guestList = rooms.get(roomId.id);

  if (guestList) {
    guestList?.delete(userId);

    if (guestList?.size === 0) {
      rooms.delete(roomId.id);
    }
  }

  socketIndex.delete(socketId);

  return { ok: true, roomId, userId };
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

  const { roomId, userId } = registered;

  const guestList = rooms.get(roomId.id);

  if (guestList) {
    guestList?.delete(userId);

    if (guestList?.size === 0) {
      rooms.delete(roomId.id);
    }
  }

  socketIndex.delete(socketId);

  return { ok: true, roomId, userId };
};

export const getOccupancy = ({
  roomId,
  capacity,
}: {
  roomId: RoomId;
  capacity: number;
}): RoomOccupancyPayload => {
  const guestList = rooms.get(roomId.id);

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
