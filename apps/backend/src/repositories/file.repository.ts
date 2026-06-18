// src/repositories/file.repository.ts

import { mkdir, writeFile } from "node:fs/promises";
import { extname, join, basename } from "node:path"; // <-- Tambahkan 'basename' di sini
import { randomUUID } from "node:crypto";

import { prisma } from "../lib/db";
import { toFileExplorerItem } from "../mappers/explorer.mapper";
import { FolderRepository } from "./folder.repository";

const folderRepository = new FolderRepository();

export class FileRepository {
  async upload(folderId: string | null, file: File) {
    const extension = extname(file.name);
    const storedName = randomUUID() + extension.toLowerCase();

    const nameWithoutExt = basename(file.name, extension);

    // Default root
    let targetFolderId = "/";
    let folderPath = "/";

    if (folderId) {
      const folder = await folderRepository.findById(folderId);

      if (!folder) {
        throw new Error("Folder not found");
      }

      folderPath = folder.path;
      targetFolderId = folderId;
    }

    const dateDir = new Date()
      .toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
      })
      .replace(/\//g, "-");

    const directory = join("public", "uploads", dateDir);
    await mkdir(directory, { recursive: true });

    const rawStoragePath = join(directory, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(rawStoragePath, buffer);

    const cleanStoragePath = rawStoragePath.replace(/\\/g, "/");
    const virtualPath = folderPath.replace(/\\/g, "/");

    const newFile = await prisma.file.create({
      data: {
        name: nameWithoutExt,
        storedName,
        extension,
        mimeType: file.type,
        storagePath: cleanStoragePath,
        path: virtualPath,
        folderId: targetFolderId,
        size: file.size,
      },
    });

    return toFileExplorerItem(newFile);
  }

  async rename(id: string, name: string) {
    return prisma.file.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  async delete(id: string) {
    const file = await prisma.file.delete({
      where: { id },
    });

    return toFileExplorerItem(file);
  }
}
