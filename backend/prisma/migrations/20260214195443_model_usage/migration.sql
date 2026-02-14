-- CreateTable
CREATE TABLE "ModelUsage" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelUsage_model_idx" ON "ModelUsage"("model");
