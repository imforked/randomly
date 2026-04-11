import { prisma } from "../lib/prisma.ts";
import { getDateTime30MinutesFromNow } from "../utils.ts";
import { RoomConfig } from "../generated/prisma/client.ts";

export const createRoomConfig = async (
  roomConfig: Omit<RoomConfig, "id" | "expiresAt">
) => {
  return await prisma.roomConfig.create({
    data: { ...roomConfig, expiresAt: getDateTime30MinutesFromNow() },
  });
};

export const getRoomConfig = async (roomId: Pick<RoomConfig, "id">) => {
  return await prisma.roomConfig.findUnique({ where: roomId });
};

export const deleteRoomConfig = async (roomId: Pick<RoomConfig, "id">) => {
  return await prisma.roomConfig.delete({ where: roomId });
};
