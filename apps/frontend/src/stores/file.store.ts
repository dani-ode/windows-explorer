// src/stores/file.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";

import { fileApi } from "../api/file.api";
import { useFolderStore } from "./folder.store";

import type { ExplorerItem } from "../types/explorer-item";

export const useFileStore = defineStore("file", () => {
  const folderStore = useFolderStore();

  // =========================
  // State
  // =========================
  const isUploading = ref<boolean>(false);

  // =========================
  // Upload File
  // =========================
  // Helper fungsi rekursif untuk mencari dan menyuntikkan file baru ke dalam sidebar tree
  function appendFileToTree(
    nodes: ExplorerItem[],
    folderId: string,
    newFile: ExplorerItem,
  ) {
    for (const node of nodes) {
      if (node.id === folderId) {
        node.hasChildren = true;

        if (node.loaded && node.children) {
          node.children.push(newFile);

          // PERBAIKAN: Sort by type DESC (Folder dulu baru File)
          node.children.sort((a, b) => b.type.localeCompare(a.type));
        }
        return true;
      }

      if (node.children && node.children.length > 0) {
        const found = appendFileToTree(node.children, folderId, newFile);
        if (found) return true;
      }
    }
    return false;
  }

  async function uploadFile(file: File, folderId: string | null) {
    if (!file) return;

    try {
      isUploading.value = true;

      // Jika folderId bernilai null atau "root", samakan menjadi "/" sesuai standarisasi DB kamu
      const targetFolderId =
        folderId === null || folderId === "root" ? "/" : folderId;

      const { data } = await fileApi.upload(file, targetFolderId);

      // --- 1. SINKRONISASI HALAMAN TENGAH (FolderList) ---
      // Jika folder yang sedang dibuka saat ini sama dengan folder tempat kita upload
      if (folderStore.selectedFolder?.id === targetFolderId) {
        folderStore.children.push(data);

        // PERBAIKAN: Sort by type DESC (Folder dulu baru File)
        folderStore.children.sort((a, b) => b.type.localeCompare(a.type));
      }

      // --- 2. SINKRONISASI SIDEBAR KIRI (FolderTree) ---
      if (targetFolderId === "/") {
        // KASUS KHUSUS ROOT: Jika diupload ke "/", artinya file berada di level paling luar (sejajar dengan Documents, Downloads, dll)
        // Maka file baru harus dimasukkan ke array roots utama di sidebar
        folderStore.roots.push(data);

        // PERBAIKAN: Sort by type DESC (Folder dulu baru File)
        folderStore.roots.sort((a, b) => b.type.localeCompare(a.type));
      } else {
        // KASUS SUB-FOLDER: Cari folder induknya di dalam pohon tree secara mendalam
        appendFileToTree(folderStore.roots, targetFolderId, data);
      }

      return data;
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    } finally {
      isUploading.value = false;
    }
  }

  // =========================
  // Rename File
  // =========================
  async function renameFile(item: ExplorerItem, name: string) {
    const value = name.trim();

    if (!value) return;

    try {
      const { data } = await fileApi.rename(item.id, value);

      // Update data object file yang ada di UI secara langsung
      Object.assign(item, data);

      // Sinkronisasi data di dalam list children folder store jika ada
      const targetInChildren = folderStore.children.find(
        (f) => f.id === item.id,
      );
      if (targetInChildren) {
        Object.assign(targetInChildren, data);
      }
    } catch (error) {
      console.error("Failed to rename file:", error);
      throw error;
    }
  }

  // Helper fungsi rekursif untuk menghapus file dari dalam sub-folder sidebar tree
  function removeFileFromTree(
    nodes: ExplorerItem[],
    folderId: string,
    fileId: string,
  ) {
    for (const node of nodes) {
      if (node.id === folderId) {
        if (node.children) {
          // Filter dan hapus file dari array children sub-folder ini
          node.children = node.children.filter((f) => f.id !== fileId);

          // Jika setelah dihapus foldernya jadi kosong melompong, kamu bisa set hasChildren ke false (opsional)
          if (node.children.length === 0) {
            node.hasChildren = false;
          }
        }
        return true;
      }

      // Telusuri sub-folder lebih dalam jika ada
      if (node.children && node.children.length > 0) {
        const found = removeFileFromTree(node.children, folderId, fileId);
        if (found) return true;
      }
    }
    return false;
  }

  // =========================
  // Delete File
  // =========================
  async function deleteFile(item: ExplorerItem) {
    try {
      await fileApi.remove(item.id);

      // --- 1. SINKRONISASI HALAMAN TENGAH (FolderList) ---
      folderStore.children = folderStore.children.filter(
        (f) => f.id !== item.id,
      );

      // --- 2. SINKRONISASI SIDEBAR KIRI (FolderTree) ---
      const targetFolderId = item.parentId; // Mengambil ID tempat file ini berada

      if (targetFolderId === "/" || !targetFolderId) {
        // KASUS ROOT: Jika file berada di level paling luar, hapus langsung dari roots utama
        folderStore.roots = folderStore.roots.filter((f) => f.id !== item.id);
      } else {
        // KASUS SUB-FOLDER: Cari folder induknya di dalam tree, lalu bersihkan filenya
        removeFileFromTree(folderStore.roots, targetFolderId, item.id);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  }

  return {
    isUploading,

    uploadFile,
    renameFile,
    deleteFile,
  };
});
