import { Request, Response } from "express";
import { roomConfigCreateBodySchema } from "../schemas/roomConfig.ts";
import {
  createRoomConfig,
  fetchRoomById,
  isRoomExpired,
} from "../services/rooms.service.ts";
import { RoomConfig } from "../generated/prisma/client.ts";
import { getOccupancy } from "../services/presence.service.ts";
import { loadActiveRoom } from "./utils.ts";

export const createRoom = async (req: Request, res: Response) => {
  const parsed = roomConfigCreateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "invalid body",
      details: parsed.error.flatten(),
    });
  }

  const createdRoomConfig = await createRoomConfig(parsed.data);

  return res.status(201).json(createdRoomConfig);
};

export const getRoomById = async (req: Request, res: Response) => {
  const roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (room === null) return;

  return res.status(200).json(room);
};

export const getRoomOccupancy = async (req: Request, res: Response) => {
  const roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "invalid room id." });
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
