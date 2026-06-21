import { prisma } from "../lib/prisma.ts";
import { getDateTime30MinutesFromNow } from "../utils.ts";
import { RoomConfig } from "../generated/prisma/client.ts";
import { RoomId } from "../types/realtime.ts";

export const createRoomConfig = async (
  roomConfig: Omit<RoomConfig, "id" | "expiresAt">
) => {
  return await prisma.roomConfig.create({
    data: { ...roomConfig, expiresAt: getDateTime30MinutesFromNow() },
  });
};

export const fetchRoomById = async (roomId: RoomId) => {
  return await prisma.roomConfig.findUnique({ where: roomId });
};

export const deleteRoomConfig = async (roomId: RoomId) => {
  return await prisma.roomConfig.delete({ where: roomId });
};

export const isRoomExpired = (room: RoomConfig): boolean => {
  return Number(room.expiresAt) < Date.now();
};
