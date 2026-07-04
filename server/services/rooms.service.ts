import { prisma } from "../lib/prisma.ts";
import { getDateTime30MinutesFromNow } from "../utils.ts";
import { RoomConfig } from "../generated/prisma/client.ts";
import { RoomId } from "../types/realtime.ts";

export const createRoomConfig = async (
  roomConfig: Pick<RoomConfig, "topic" | "size" | "optionsPerGuest">
) => {
  return await prisma.roomConfig.create({
    data: { ...roomConfig, expiresAt: getDateTime30MinutesFromNow() },
  });
};

export const fetchRoomById = async (roomId: RoomId) => {
  return await prisma.roomConfig.findUnique({ where: roomId });
};

export const deleteRoomConfig = async (roomId: RoomId) => {
  return await prisma.$transaction(async (tx) => {
    await tx.roomConfig.update({
      where: roomId,
      data: { selectedOptionId: null },
    });
    return await tx.roomConfig.delete({ where: roomId });
  });
};

export const isRoomExpired = (room: RoomConfig): boolean => {
  return Number(room.expiresAt) < Date.now();
};

export const deleteExpiredRoom = async (room: RoomConfig) => {
  if (!isRoomExpired(room)) {
    return;
  }

  await deleteRoomConfig({ id: room.id });

  return true;
};

export const deleteAllExpiredRooms = async () => {
  const expired = await prisma.roomConfig.findMany({
    where: { expiresAt: { lt: new Date() } },
    select: { id: true },
  });

  for (const room of expired) {
    await deleteRoomConfig({ id: room.id });
  }
};
