/*
  Warnings:

  - You are about to drop the column `transitionId` on the `contribution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contributionId]` on the table `transition` will be added. If there are existing duplicate values, this will fail.
  - Made the column `recommendationId` on table `contribution` required. This step will fail if there are existing NULL values in that column.
  - Made the column `guidelineId` on table `recommendation` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `contributionId` to the `transition` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."contribution" DROP CONSTRAINT "contribution_transitionId_fkey";

-- DropIndex
DROP INDEX "public"."contribution_transitionId_key";

-- AlterTable
ALTER TABLE "public"."contribution" DROP COLUMN "transitionId",
ALTER COLUMN "recommendationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."recommendation" ALTER COLUMN "guidelineId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."transition" ADD COLUMN     "contributionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transition_contributionId_key" ON "public"."transition"("contributionId");

-- AddForeignKey
ALTER TABLE "public"."transition" ADD CONSTRAINT "transition_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "public"."contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
