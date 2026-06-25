import { Request, Response } from "express";
import {
  countUserOptionsInRoom,
  createOptions as createOptionsConfig,
  getOptionsInRoom,
  selectRandomOption,
} from "../services/options.service.ts";
import { optionsCreateBodySchema } from "../schemas/options.ts";
import { loadActiveRoom } from "./utils.ts";
import { getUserInRoom } from "../services/user.service.ts";

export const createOptions = async (req: Request, res: Response) => {
  const parsed = optionsCreateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid body.",
      details: parsed.error.flatten(),
    });
  }

  let roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (!room) {
    return;
  }

  const user = await getUserInRoom({ userId: parsed.data.userId, roomId });

  if (!user) {
    return res
      .status(403)
      .json({ error: "User does not belong to this room." });
  }

  const existingCount = await countUserOptionsInRoom({
    userId: parsed.data.userId,
    roomId,
  });

  if (existingCount + parsed.data.options.length > room.optionsPerGuest) {
    return res.status(409).json({
      error: `You can only add ${room.optionsPerGuest} options.`,
    });
  }

  const options = await createOptionsConfig(
    parsed.data.options.map((option) => {
      return {
        value: option,
        userId: parsed.data.userId,
        roomId: room.id,
      };
    })
  );

  return res.status(201).json(options);
};

export const getOptionsWithUsers = async (req: Request, res: Response) => {
  let roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (!room) {
    return;
  }

  const optionsWithUsers = await getOptionsInRoom({ roomId });

  return res.status(200).json(optionsWithUsers);
};

export const getRandomOption = async (req: Request, res: Response) => {
  let roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (!room) {
    return;
  }

  const randomOption = await selectRandomOption({ roomId });

  if (!randomOption) {
    return res.status(404).json({ error: "No options found for this room." });
  }

  return res.status(200).json(randomOption);
};
