-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('NORMAL', 'ANNOUNCEMENT', 'TASK');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'NORMAL',
ALTER COLUMN "conversationId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Message_channelId_createdAt_idx" ON "Message"("channelId", "createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
