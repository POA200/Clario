-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER';
