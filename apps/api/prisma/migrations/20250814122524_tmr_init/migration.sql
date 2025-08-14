-- CreateEnum
CREATE TYPE "public"."Derivative" AS ENUM ('INCREASE', 'DECREASE', 'MAINTAIN');

-- CreateEnum
CREATE TYPE "public"."Situation" AS ENUM ('NORMAL', 'HIGH', 'LOW', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."ContributionValue" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "public"."RecommendationStrength" AS ENUM ('SHOULD', 'NOT');

-- CreateTable
CREATE TABLE "public"."transition" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "derivative" "public"."Derivative" NOT NULL,
    "property" TEXT NOT NULL,
    "pre" "public"."Situation" NOT NULL,
    "post" "public"."Situation" NOT NULL,

    CONSTRAINT "transition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contribution" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" "public"."ContributionValue" NOT NULL DEFAULT 'NEUTRAL',
    "transitionId" INTEGER NOT NULL,
    "recommendationId" INTEGER,

    CONSTRAINT "contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recommendation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "strength" "public"."RecommendationStrength" NOT NULL,
    "guidelineId" INTEGER,

    CONSTRAINT "recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guideline" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "guideline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contribution_transitionId_key" ON "public"."contribution"("transitionId");

-- AddForeignKey
ALTER TABLE "public"."contribution" ADD CONSTRAINT "contribution_transitionId_fkey" FOREIGN KEY ("transitionId") REFERENCES "public"."transition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribution" ADD CONSTRAINT "contribution_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "public"."recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recommendation" ADD CONSTRAINT "recommendation_guidelineId_fkey" FOREIGN KEY ("guidelineId") REFERENCES "public"."guideline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
