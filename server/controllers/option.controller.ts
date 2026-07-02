import { Request, Response } from "express";
import {
  countUserOptionsInRoom,
  createOptions as createOptionsConfig,
  getOptionsInRoom,
  getOrSelectRandomOption,
  getSelectedOption,
} from "../services/options.service.ts";
import { optionsCreateBodySchema } from "../schemas/options.ts";
import { loadActiveRoom } from "./utils.ts";
import { getUserInRoom } from "../services/user.service.ts";
import {
  broadcastSelection,
  broadcastSubmissions,
} from "../realtime/roomSocket.ts";
import { getSubmissions } from "../services/submissions.service.ts";
import {
  isRoomReadyForSelection,
  toSelectionPayload,
  tryCompleteRoomSelection,
} from "../services/selection.service.ts";

export const createOptions = async (req: Request, res: Response) => {
  const parsed = optionsCreateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "invalid body.",
      details: parsed.error.flatten(),
    });
  }

  let roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (!room) {
    return;
  }

  const user = await getUserInRoom({ userId: parsed.data.userId, roomId });

  if (!user) {
    return res
      .status(403)
      .json({ error: "user does not belong to this room." });
  }

  const existingCount = await countUserOptionsInRoom({
    userId: parsed.data.userId,
    roomId,
  });

  if (existingCount + parsed.data.options.length > room.optionsPerGuest) {
    return res.status(409).json({
      error: `you can only add ${room.optionsPerGuest} options.`,
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

  const submissions = await getSubmissions({ roomId });

  const roomIdRef = { id: roomId };

  broadcastSubmissions({
    roomId: roomIdRef,
    payload: {
      roomId: roomIdRef,
      submissions,
    },
  });

  const selection = await tryCompleteRoomSelection({
    roomId,
    roomSize: room.size,
  });

  if (selection) {
    broadcastSelection({
      roomId: roomIdRef,
      payload: {
        roomId: roomIdRef,
        option: toSelectionPayload(selection),
      },
    });
  }

  return res.status(201).json({
    options,
    selection: selection ? toSelectionPayload(selection) : null,
  });
};

export const getOptionsWithUsers = async (req: Request, res: Response) => {
  let roomId = req.params.id;

  if (typeof roomId !== "string") {
    return res.status(400).json({ error: "invalid room id." });
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
    return res.status(400).json({ error: "invalid room id." });
  }

  const room = await loadActiveRoom(roomId, res);

  if (!room) {
    return;
  }

  const existingSelection = await getSelectedOption({ roomId });

  if (existingSelection) {
    return res.status(200).json(existingSelection);
  }

  const ready = await isRoomReadyForSelection({
    roomId,
    roomSize: room.size,
  });

  if (!ready) {
    return res.status(409).json({ error: "room is not ready for selection." });
  }

  const randomOption = await getOrSelectRandomOption({ roomId });

  if (!randomOption) {
    return res.status(404).json({ error: "no options found for this room." });
  }

  const roomIdRef = { id: roomId };

  broadcastSelection({
    roomId: roomIdRef,
    payload: {
      roomId: roomIdRef,
      option: toSelectionPayload(randomOption),
    },
  });

  return res.status(200).json(randomOption);
};
