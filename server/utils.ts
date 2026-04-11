import { RoomConfig } from "./generated/prisma/client.ts";
import { prisma } from "./lib/prisma.ts";

export const getDateTime30MinutesFromNow = (): Date => {
  return new Date(Date.now() + 30 * 60 * 1000);
};

export const roomIsUnexpired = async (room: RoomConfig) => {
  if (room.expiresAt < new Date()) {
    return false;
  }

  return true;
};
