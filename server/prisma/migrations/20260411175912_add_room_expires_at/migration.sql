-- CreateTable
CREATE TABLE "RoomConfig" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "optionsPerGuest" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomConfig_pkey" PRIMARY KEY ("id")
);
