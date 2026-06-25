import { userCreateBodySchema } from "../schemas/user.ts";
import { Request, Response } from "express";
import {
  countUsersInRoom,
  createUser as createUserConfig,
  getUsersInRoom,
} from "../services/user.service.ts";
import { loadActiveRoom } from "./utils.ts";
import { RoomId } from "../types/realtime.ts";

export const createUser = async (req: Request, res: Response) => {
  const parsed = userCreateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid body",
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

  const existingUserCount = await countUsersInRoom({ roomId });

  if (existingUserCount >= room.size) {
    return res.status(409).json({
      error: "Room is full.",
    });
  }

  const user = await createUserConfig({
    name: parsed.data.name,
    roomId,
  });

  return res.status(201).json(user);
};

export const getUsers = async (req: Request, res: Response) => {
  let roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (!room) {
    return;
  }

  const users = await getUsersInRoom({ roomId });

  return res.status(200).json(users);
};
