import { Request, Response } from "express";
import { getSubmissions } from "../services/submissions.service.ts";
import { loadActiveRoom } from "./utils.ts";

export const getRoomSubmissions = async (req: Request, res: Response) => {
  let roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (!room) {
    return;
  }

  const submissions = await getSubmissions({ roomId });

  return res.status(200).json(submissions);
};
