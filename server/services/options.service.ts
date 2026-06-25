import { prisma } from "../lib/prisma.ts";
import { Option } from "../generated/prisma/client.ts";

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
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
};

export const selectRandomOption = async ({ roomId }: { roomId: string }) => {
  const options = await prisma.option.findMany({
    where: { roomId },
    include: { user: true },
  });

  if (!options.length) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * options.length);

  return options[randomIndex];
};
