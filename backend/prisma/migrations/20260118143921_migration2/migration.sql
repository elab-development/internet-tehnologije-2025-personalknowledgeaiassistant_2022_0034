/*
  Warnings:

  - Changed the type of `fileType` on the `Document` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'TXT', 'MD');

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "fileType",
ADD COLUMN     "fileType" "FileType" NOT NULL;
