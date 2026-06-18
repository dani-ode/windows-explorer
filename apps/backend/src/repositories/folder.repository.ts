// src/repositories/folder.repository.ts

import { prisma } from "../lib/db";
import { toFolderExplorerItem } from "../mappers/explorer.mapper";
import { randomUUID } from "crypto";

export class FolderRepository {
  async findChildren(folderId: string) {
    if (folderId === "root") {
      folderId = "/";
    }

    const [folders, files] = await Promise.all([
      // 1. Ambil sub-folder sekaligus hitung jumlah isi di dalamnya menggunakan _count
      prisma.folder.findMany({
        where: { parentId: folderId },
        include: {
          _count: {
            select: {
              children: true, // menghitung folder di dalamnya
              files: true, // menghitung file di dalamnya
            },
          },
        },
        orderBy: { name: "asc" },
      }),

      // 2. Ambil file di dalam folder saat ini
      prisma.file.findMany({
        where: { folderId },
        orderBy: { name: "asc" },
      }),
    ]);

    const url = process.env.APP_URL ?? "http://localhost:3000";

    // 3. Logika boolean untuk folder induk yang sedang dibuka:
    // True jika ada setidaknya 1 folder ATAU 1 file di dalamnya
    const currentFolderHasChildren = folders.length > 0 || files.length > 0;

    return {
      // Kamu bisa melempar status hasChildren folder induk ini ke response jika dibutuhkan UI
      hasChildren: currentFolderHasChildren,

      items: [
        // Map data sub-folders
        ...folders.map((f) => {
          // Cek apakah sub-folder ini punya isi (folder lain atau file)
          const totalItemsInside =
            (f._count?.children ?? 0) + (f._count?.files ?? 0);

          return {
            id: f.id,
            name: f.name,
            type: "folder",
            parentId: f.parentId,
            path: f.path,
            // Nilai dinamis: true jika ada isi, false jika kosong melompong
            hasChildren: totalItemsInside > 0,
            icon: f.icon,
          };
        }),

        // Map data files (file selalu bernilai false untuk hasChildren)
        ...files.map((f) => ({
          id: f.id,
          name: f.name,
          type: "file",
          parentId: f.folderId,
          path: f.path,
          url: `${url}/${f.storagePath.replace(/\\/g, "/")}`, // pastikan slash aman untuk url
          size: f.size,
          mimeType: f.mimeType,
          extension: f.extension,
          hasChildren: false,
        })),
      ],
    };
  }

  async findById(id: string) {
    const folder = await prisma.folder.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    if (!folder) {
      return null;
    }

    return toFolderExplorerItem(folder);
  }

  async findBreadcrumb(id: string) {
    const folder = await prisma.folder.findUnique({
      where: {
        id,
      },
      select: {
        path: true,
      },
    });

    if (!folder) {
      return [];
    }

    const ids = folder.path.split("/");

    const folders = await prisma.folder.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const map = new Map(folders.map((f) => [f.id, f]));

    return ids
      .map((id) => map.get(id))
      .filter(
        (
          folder,
        ): folder is {
          id: string;
          name: string;
        } => !!folder,
      );
  }

  // Additional methods for creating, updating, and deleting folders can be added here ----

  async rename(id: string, name: string) {
    return prisma.folder.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  async delete(id: string) {
    await prisma.folder.delete({
      where: {
        id,
      },
    });
  }

  async create(name: string, parentId: string | null) {
    const folderId = randomUUID();

    let parentPath: string | null = null;

    if (parentId) {
      const parent = await this.findById(parentId);

      if (!parent) {
        throw new Error("Parent folder not found");
      }

      parentPath = parent.path;
    }

    const path = parentPath ? `${parentPath}/${folderId}` : folderId;

    return prisma.folder.create({
      data: {
        id: folderId,
        name,
        parentId,
        path,
        icon: "folder",
      },
    });
  }
}
