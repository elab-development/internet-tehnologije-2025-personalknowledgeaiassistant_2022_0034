/*
  Warnings:

  - Changed the type of `embedding` on the `Segment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "Segment" DROP COLUMN "embedding",
ADD COLUMN     "embedding" vector(768) NOT NULL;
