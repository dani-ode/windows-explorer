import { prisma } from "../lib/db";

export class SearchRepository {
  async search(
    folderId: string | null | undefined,
    keyword: string,
    page: number,
    limit: number,
  ) {
    let folderPath = "";

    // ========================================================
    // PERBAIKAN ERROR: Penanganan khusus jika mencari dari ROOT
    // ========================================================
    const isRoot = !folderId || folderId === "root" || folderId === "/";

    if (!isRoot) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId as string },
        select: { id: true, path: true },
      });

      if (!folder) {
        throw new Error("Folder not found");
      }
      folderPath = folder.path;
    }

    const offset = (page - 1) * limit;
    const q = keyword.trim();

    // ========================================================
    // KONDISI FILTER (Berdasarkan cakupan Path)
    // ========================================================
    const folderPathFilter = isRoot
      ? {} // Jika di root, cari ke seluruh database tanpa batas sub-folder
      : { path: { startsWith: `${folderPath}/` } };

    const fileFolderFilter = isRoot
      ? {} // Jika di root, cari semua file di folder manapun
      : { folder: { path: { startsWith: `${folderPath}/` } } };

    const whereFolder = {
      ...folderPathFilter,
      name: {
        contains: q,
        mode: "insensitive" as const,
      },
    };

    const whereFile = {
      ...fileFolderFilter,
      name: {
        contains: q,
        mode: "insensitive" as const,
      },
    };

    // Eksekusi pencarian data secara paralel
    const [folders, files] = await Promise.all([
      prisma.folder.findMany({
        where: whereFolder,
        orderBy: { path: "asc" },
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: { children: true },
          },
        },
      }),

      prisma.file.findMany({
        where: whereFile,
        orderBy: { path: "asc" },
        skip: offset,
        take: limit,
        // Sertakan relasi folder induk untuk memetakan breadcrumb file dengan akurat
        include: {
          folder: {
            select: { path: true },
          },
        },
      }),
    ]);

    // ========================================================
    // BUILD MAP UNTUK KEBUTUHAN BREADCRUMB
    // ========================================================
    const ids = new Set<string>();

    // Ambil ID folder dari path folder yang ketemu
    folders.forEach((f) => {
      f.path.split("/").forEach((id) => {
        if (id) ids.add(id);
      });
    });

    // Ambil ID folder dari path milik induk file yang ketemu
    files.forEach((file) => {
      if (file.folder?.path) {
        file.folder.path.split("/").forEach((id) => {
          if (id) ids.add(id);
        });
      }
    });

    const folderMeta = await prisma.folder.findMany({
      where: {
        id: { in: Array.from(ids) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const folderMap = new Map(folderMeta.map((f) => [f.id, f.name]));

    // Helper untuk menyusun string breadcrumb
    const buildBreadcrumbString = (pathString: string) => {
      return pathString
        .split("/")
        .filter(Boolean)
        .map((id) => folderMap.get(id))
        .filter(Boolean)
        .join(" / ");
    };

    // ========================================================
    // FORMAT RESPONSE (Disamakan strukturnya dengan findChildren)
    // ========================================================

    const url = process.env.APP_URL ?? "http://localhost:3000";
    return {
      items: [
        ...folders.map((f) => ({
          id: f.id,
          name: f.name,
          type: "folder" as const,
          parentId: f.parentId === "/" ? null : f.parentId, // standarisasi null/string
          path: f.path,
          hasChildren: f._count.children > 0,
          breadcrumb: buildBreadcrumbString(f.path),
        })),

        ...files.map((file) => ({
          id: file.id,
          name: file.name,
          type: "file" as const,
          parentId: file.folderId,
          path: file.path,
          size: file.size,
          // IMPLEMENTASI METADATA FILE (Penting untuk render gambar/icon tanpa refresh)
          mimeType: file.mimeType,
          extension: file.extension,
          url: `${url}/${file.storagePath.replace(/\\/g, "/")}`,
          // File sekarang memiliki jejak breadcrumb folder tempat ia bernaung
          breadcrumb: file.folder?.path
            ? buildBreadcrumbString(file.folder.path)
            : "",
        })),
      ],
      total: folders.length + files.length,
      page,
      limit,
    };
  }
}
