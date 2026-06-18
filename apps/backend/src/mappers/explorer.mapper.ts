// src/mappers/explorer.mapper.ts

import type { ExplorerItemDto } from "../dtos/explorer-item.dto";
import type { File, Folder } from "../generated/client/client";

type FolderWithCount = Folder & {
  _count?: {
    children: number;
  };
};

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export function toFolderExplorerItem(folder: FolderWithCount): ExplorerItemDto {
  return {
    id: folder.id,
    name: folder.name,

    type: "folder",

    parentId: folder.parentId,
    hasChildren: (folder._count?.children ?? 0) > 0,

    path: folder.path,

    icon: folder.icon,
  };
}

export function toFileExplorerItem(file: File): ExplorerItemDto {
  return {
    id: file.id,
    name: file.name,

    type: "file",

    parentId: file.folderId,
    // folderId: file.folderId,

    hasChildren: false,

    path: file.path,

    extension: file.extension ?? undefined,
    storedName: file.storedName,

    // storagePath: file.storagePath,
    url: `${APP_URL}/${file.storagePath}`,

    size: file.size,
    mimeType: file.mimeType ?? undefined,
    icon: file.icon,
  };
}
