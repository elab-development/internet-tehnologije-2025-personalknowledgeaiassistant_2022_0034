/*
  Warnings:

  - You are about to drop the `ModelUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ModelUsage";

-- CreateTable
CREATE TABLE "ModelStats" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelStats_modelName_key" ON "ModelStats"("modelName");
