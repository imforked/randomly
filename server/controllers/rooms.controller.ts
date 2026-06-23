import { Request, Response } from "express";
import { roomConfigCreateBodySchema } from "../schemas/roomConfig.ts";
import {
  createRoomConfig,
  fetchRoomById,
  isRoomExpired,
} from "../services/rooms.service.ts";
import { RoomConfig } from "../generated/prisma/client.ts";
import { getOccupancy } from "../services/presence.service.ts";
import { type RoomId } from "../types/realtime.ts";

const loadActiveRoom = async (
  roomId: string,
  res: Response
): Promise<RoomConfig | null> => {
  const room = await fetchRoomById({ id: roomId });
  if (room === null) {
    res.status(404).json({ error: "Room not found." });
    return null;
  }
  if (isRoomExpired(room)) {
    res.status(410).json({ error: "Room expired." });
    return null;
  }
  return room;
};

export const createRoom = async (req: Request, res: Response) => {
  const parsed = roomConfigCreateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid body",
      details: parsed.error.flatten(),
    });
  }

  const createdRoomConfig = await createRoomConfig(parsed.data);

  return res.status(201).json(createdRoomConfig);
};

export const getRoomById = async (req: Request, res: Response) => {
  const roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (room === null) return;

  return res.status(200).json(room);
};

export const getRoomOccupancy = async (req: Request, res: Response) => {
  const roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (room === null) return;

  const { activeCount, spotsRemaining } = getOccupancy({
    roomId: { id: roomId },
    capacity: room.size,
  });

  return res.status(200).json({
    roomId: room.id,
    capacity: room.size,
    activeCount,
    spotsRemaining,
  });
};
