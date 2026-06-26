import { prisma } from "../lib/prisma.ts";
import { getUsersInRoom } from "./user.service.ts";

export const getSubmissions = async ({ roomId }: { roomId: string }) => {
  const options = await prisma.option.findMany({ where: { roomId } });

  const users = await getUsersInRoom({ roomId });

  const submissions = users.map(({ id, name }) => {
    return {
      id,
      name,
      hasSubmitted: options.some(({ userId }) => userId === id),
    };
  });

  return submissions;
};
