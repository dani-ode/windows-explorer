/*
  Warnings:

  - Added the required column `path` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'file',
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'folder',
ADD COLUMN     "path" TEXT NOT NULL;
