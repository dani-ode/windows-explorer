/*
  Warnings:

  - Added the required column `storagePath` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storedName` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "extension" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "storagePath" TEXT NOT NULL,
ADD COLUMN     "storedName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
