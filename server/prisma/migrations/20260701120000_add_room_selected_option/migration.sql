-- AlterTable
ALTER TABLE "RoomConfig" ADD COLUMN "selectedOptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RoomConfig_selectedOptionId_key" ON "RoomConfig"("selectedOptionId");

-- AddForeignKey
ALTER TABLE "RoomConfig" ADD CONSTRAINT "RoomConfig_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
