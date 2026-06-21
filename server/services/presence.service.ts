import { RoomOccupancyPayload, RoomId } from "../types/realtime.ts";

const rooms = new Map<string, Map<string, string>>();

const socketIndex = new Map<
  string,
  { roomId: RoomId; participantId: string }
>();

type JoinResult =
  | { ok: true }
  | { ok: false; reason: "ALREADY_CONNECTED" }
  | { ok: false; reason: "FULL" };

type LeaveByPayloadResult =
  | { ok: true; roomId: RoomId; participantId: string }
  | { ok: false; reason: "INVALID_PAYLOAD" }
  | { ok: false; reason: "NOOP" };

type LeaveBySocketResult =
  | { ok: true; roomId: RoomId; participantId: string }
  | { ok: false; reason: "NOOP" };

export const tryJoin = ({
  roomId,
  participantId,
  socketId,
  capacity,
}: {
  roomId: RoomId;
  participantId: string;
  socketId: string;
  capacity: number;
}): JoinResult => {
  let guestList = rooms.get(roomId.id);

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
    rooms.set(roomId.id, guestList);
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
  roomId: RoomId;
  participantId: string;
  socketId: string;
}): LeaveByPayloadResult => {
  const registered = socketIndex.get(socketId);

  if (!registered) {
    return { ok: false, reason: "NOOP" };
  }

  if (
    registered.roomId.id !== roomId.id ||
    registered.participantId !== participantId
  ) {
    return { ok: false, reason: "INVALID_PAYLOAD" };
  }

  const guestList = rooms.get(roomId.id);

  if (guestList) {
    guestList?.delete(participantId);

    if (guestList?.size === 0) {
      rooms.delete(roomId.id);
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

  const guestList = rooms.get(roomId.id);

  if (guestList) {
    guestList?.delete(participantId);

    if (guestList?.size === 0) {
      rooms.delete(roomId.id);
    }
  }

  socketIndex.delete(socketId);

  return { ok: true, roomId, participantId };
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
