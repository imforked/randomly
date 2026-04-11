import { Request, Response } from "express";
import { roomConfigCreateBodySchema } from "../schemas/roomConfig.ts";
import { createRoomConfig } from "../services/rooms.service.ts";

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
