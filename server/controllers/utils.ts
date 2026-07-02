import { RoomConfig } from "../generated/prisma/client.ts";
import { fetchRoomById, isRoomExpired } from "../services/rooms.service.ts";
import { Response } from "express";

export const loadActiveRoom = async (
  roomId: string,
  res: Response
): Promise<RoomConfig | null> => {
  const room = await fetchRoomById({ id: roomId });
  if (room === null) {
    res.status(404).json({ error: "room not found." });
    return null;
  }
  if (isRoomExpired(room)) {
    res.status(410).json({ error: "room expired." });
    return null;
  }
  return room;
};
