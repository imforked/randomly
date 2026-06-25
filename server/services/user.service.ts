import { User } from "../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";
import { RoomId } from "../types/realtime.ts";

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

export const getUsersInRoom = async ({ roomId }: { roomId: RoomId }) => {
  return await prisma.user.findMany({
    where: { roomId: roomId.id },
    orderBy: { createdAt: "asc" },
  });
};
