import { z } from "zod";
import {
  ROOM_SIZE_MIN,
  ROOM_SIZE_MAX,
  OPTIONS_PER_GUEST_MIN,
  OPTIONS_PER_GUEST_MAX,
} from "@shared/roomConfigLimits";

export const MAX_CHARACTER_LIMIT = 100;

export const CreateRoomSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(1, "The topic must be at least 1 character.")
    .max(
      MAX_CHARACTER_LIMIT,
      `The topic can be a max of ${MAX_CHARACTER_LIMIT} characters.`
    ),
  size: z
    .number()
    .min(
      ROOM_SIZE_MIN,
      `Room must have at least ${ROOM_SIZE_MIN} guest${
        ROOM_SIZE_MIN > 1 ? "s" : ""
      }.`
    )
    .max(ROOM_SIZE_MAX, `Room can have a max of ${ROOM_SIZE_MAX} guests.`),
  optionsPerGuest: z
    .number()
    .min(
      OPTIONS_PER_GUEST_MIN,
      `Guests must be able to submit at least ${OPTIONS_PER_GUEST_MIN} option${
        OPTIONS_PER_GUEST_MIN > 1 ? "s" : ""
      }.`
    )
    .max(
      OPTIONS_PER_GUEST_MAX,
      `Guests can have a max of ${OPTIONS_PER_GUEST_MAX} options.`
    ),
});

export type FormError = ReturnType<
  typeof z.flattenError<z.infer<typeof CreateRoomSchema>>
> | null;
