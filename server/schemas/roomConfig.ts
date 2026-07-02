import { z } from "zod";
import {
  OPTIONS_PER_GUEST_MAX,
  OPTIONS_PER_GUEST_MIN,
  ROOM_SIZE_MAX,
  ROOM_SIZE_MIN,
} from "../constants/roomConfigLimits.ts";

export const roomConfigCreateBodySchema = z.object({
  topic: z
    .string({ error: "topic is required" })
    .trim()
    .min(1, "topic is required"),
  size: z
    .coerce.number({ error: "size is required" })
    .int()
    .min(ROOM_SIZE_MIN)
    .max(ROOM_SIZE_MAX),
  optionsPerGuest: z
    .coerce.number({ error: "options per guest is required" })
    .int()
    .min(OPTIONS_PER_GUEST_MIN)
    .max(OPTIONS_PER_GUEST_MAX),
});

export type RoomConfigCreateBody = z.infer<typeof roomConfigCreateBodySchema>;
