// src/utils/breadcrumb.ts

import { prisma } from "../lib/db";

export async function buildBreadcrumb(path: string): Promise<string> {
  const ids = path.split("/").filter(Boolean);

  if (!ids.length) {
    return "";
  }

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

  const map = new Map(folders.map((f) => [f.id, f.name]));

  return ids
    .map((id) => map.get(id))
    .filter(Boolean)
    .join("/");
}
