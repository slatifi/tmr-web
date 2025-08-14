/*
  Warnings:

  - Added the required column `userId` to the `guideline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."guideline" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."guideline" ADD CONSTRAINT "guideline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
