import {
  getOrSelectRandomOption,
  type OptionWithUser,
} from "./options.service.ts";
import { getSubmissions } from "./submissions.service.ts";
import { getUsersInRoom } from "./user.service.ts";

export const toSelectionPayload = (option: OptionWithUser) => {
  return {
    id: option.id,
    value: option.value,
    roomId: option.roomId,
    userId: option.userId,
    user: {
      id: option.user.id,
      name: option.user.name,
    },
  };
};

export const isRoomReadyForSelection = async ({
  roomId,
  roomSize,
}: {
  roomId: string;
  roomSize: number;
}) => {
  const users = await getUsersInRoom({ roomId });

  if (users.length < roomSize) {
    return false;
  }

  const submissions = await getSubmissions({ roomId });

  return (
    submissions.length >= roomSize &&
    submissions.every((submission) => submission.hasSubmitted)
  );
};

export const tryCompleteRoomSelection = async ({
  roomId,
  roomSize,
}: {
  roomId: string;
  roomSize: number;
}): Promise<OptionWithUser | null> => {
  const ready = await isRoomReadyForSelection({ roomId, roomSize });

  if (!ready) {
    return null;
  }

  return getOrSelectRandomOption({ roomId });
};
