import { prisma } from "../lib/prisma.ts";
import { Option } from "../generated/prisma/client.ts";

const optionWithUserInclude = { user: true } as const;

export type OptionWithUser = Option & {
  user: { id: string; name: string };
};

export const createOptions = async (
  options: Pick<Option, "value" | "userId" | "roomId">[]
) => {
  return await prisma.option.createManyAndReturn({ data: options });
};

export const countUserOptionsInRoom = async ({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) => {
  return await prisma.option.count({ where: { userId, roomId } });
};

export const getOptionsInRoom = async ({ roomId }: { roomId: string }) => {
  return await prisma.option.findMany({
    where: { roomId },
    include: optionWithUserInclude,
    orderBy: { createdAt: "asc" },
  });
};

export const getSelectedOption = async ({
  roomId,
}: {
  roomId: string;
}): Promise<OptionWithUser | null> => {
  const room = await prisma.roomConfig.findUnique({
    where: { id: roomId },
    select: { selectedOptionId: true },
  });

  if (!room?.selectedOptionId) {
    return null;
  }

  return prisma.option.findUnique({
    where: { id: room.selectedOptionId },
    include: optionWithUserInclude,
  });
};

export const getOrSelectRandomOption = async ({
  roomId,
}: {
  roomId: string;
}): Promise<OptionWithUser | null> => {
  const existing = await getSelectedOption({ roomId });

  if (existing) {
    return existing;
  }

  return prisma.$transaction(async (tx) => {
    const room = await tx.roomConfig.findUnique({
      where: { id: roomId },
      select: { selectedOptionId: true },
    });

    if (room?.selectedOptionId) {
      return tx.option.findUnique({
        where: { id: room.selectedOptionId },
        include: optionWithUserInclude,
      });
    }

    const options = await tx.option.findMany({
      where: { roomId },
      include: optionWithUserInclude,
    });

    if (!options.length) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * options.length);
    const selected = options[randomIndex]!;

    await tx.roomConfig.update({
      where: { id: roomId },
      data: { selectedOptionId: selected.id },
    });

    return selected;
  });
};
