// src/seed.ts

import { prisma } from "../src/lib/db";
import { randomUUID } from "crypto";

async function main() {
  await prisma.file.deleteMany();
  await prisma.folder.deleteMany();

  const rootFolder = await prisma.folder.create({
    data: {
      id: "/",
      name: "/",
      path: "/",
      icon: "folder",
    },
  });

  // Root folders (/)
  const DocumentsID = randomUUID();
  const documents = await prisma.folder.create({
    data: {
      id: DocumentsID,
      name: "Documents",
      path: DocumentsID,
      icon: "folder",
      parentId: "/",
    },
  });

  const DownloadsID = randomUUID();
  const downloads = await prisma.folder.create({
    data: {
      id: DownloadsID,
      name: "Downloads",
      path: DownloadsID,
      icon: "folder",
      parentId: "/",
    },
  });

  const PicturesID = randomUUID();
  const VideosID = randomUUID();

  await prisma.folder.createMany({
    data: [
      {
        id: PicturesID,
        name: "Pictures",
        path: PicturesID,
        icon: "folder",
        parentId: "/",
      },
      {
        id: VideosID,
        name: "Videos",
        path: VideosID,
        icon: "folder",
        parentId: "/",
      },
    ],
  });

  // Documents children
  const projectAID = randomUUID();
  const projectA = await prisma.folder.create({
    data: {
      id: projectAID,
      name: "Project A",
      path: `${documents.path}/${projectAID}`,
      icon: "folder",
      parentId: documents.id,
    },
  });

  const projectBID = randomUUID();
  const projectB = await prisma.folder.create({
    data: {
      id: projectBID,
      name: "Project B",
      path: `${documents.path}/${projectBID}`,
      icon: "folder",
      parentId: documents.id,
    },
  });

  // Nested folders
  const srcFolderID = randomUUID();
  const srcFolder = await prisma.folder.create({
    data: {
      id: srcFolderID,
      name: "src",
      path: `${projectA.path}/${srcFolderID}`,
      icon: "folder",
      parentId: projectA.id,
    },
  });

  const docsFolderID = randomUUID();
  const srcOldFolderID = randomUUID();
  const chromeFolderID = randomUUID();
  const installerFolderID = randomUUID();
  await prisma.folder.createMany({
    data: [
      {
        id: docsFolderID,
        name: "docs",
        path: `${projectA.path}/${docsFolderID}`,
        icon: "folder",
        parentId: projectA.id,
      },
      {
        id: srcOldFolderID,
        name: "src-old",
        path: `${projectB.path}/${srcOldFolderID}`,
        icon: "folder",
        parentId: projectB.id,
      },
      {
        id: chromeFolderID,
        name: "Chrome",
        path: `${downloads.path}/${chromeFolderID}`,
        icon: "folder",
        parentId: downloads.id,
      },
      {
        id: installerFolderID,
        name: "Installer",
        path: `${downloads.path}/${installerFolderID}`,
        icon: "folder",
        parentId: downloads.id,
      },
    ],
  });

  console.log("✅ Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
