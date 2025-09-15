-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "ContentEntry" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "ContentEntry_status_idx" ON "ContentEntry"("status");

-- CreateIndex
CREATE INDEX "ContentEntry_publishedAt_idx" ON "ContentEntry"("publishedAt");

-- CreateIndex
CREATE INDEX "ContentEntry_scheduledAt_idx" ON "ContentEntry"("scheduledAt");

-- CreateIndex
CREATE INDEX "ContentEntry_authorId_idx" ON "ContentEntry"("authorId");

-- AddForeignKey
ALTER TABLE "ContentEntry" ADD CONSTRAINT "ContentEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;