import { User } from "../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

export const createUser = async (user: Pick<User, "name" | "roomId">) => {
  return await prisma.user.create({
    data: { ...user },
  });
};

export const getUserInRoom = async ({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) => {
  return await prisma.user.findFirst({
    where: { id: userId, roomId },
  });
};

export const countUsersInRoom = async ({ roomId }: { roomId: string }) => {
  return await prisma.user.count({ where: { roomId } });
};

export const getUsersInRoom = async ({ roomId }: { roomId: string }) => {
  return await prisma.user.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });
};
