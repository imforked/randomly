import { User } from "../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

export const createUser = async (user: Pick<User, "name" | "roomId">) => {
  return await prisma.user.create({
    data: { ...user },
  });
};
