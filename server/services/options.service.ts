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
