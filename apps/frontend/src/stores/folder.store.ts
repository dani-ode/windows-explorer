// src/stores/folder.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";

import { folderApi } from "../api/folder.api";

import type { ExplorerItem } from "../types/explorer-item";
import type { BreadcrumbItem } from "../types/breadcrumb";

export const useFolderStore = defineStore("folder", () => {
  // =========================
  // State
  // =========================

  const roots = ref<ExplorerItem[]>([]);
  const children = ref<ExplorerItem[]>([]);
  const selectedFolder = ref<ExplorerItem | null>(null);

  const history = ref<ExplorerItem[]>([]);
  const breadcrumb = ref<BreadcrumbItem[]>([]);

  // =========================
  // Helpers
  // =========================

  function withUiState(item: ExplorerItem): ExplorerItem {
    return {
      ...item,
      children: item.children ?? [],
      expanded: item.expanded ?? false,
      loaded: item.loaded ?? false,
      isSearchResult: item.isSearchResult ?? false,
    };
  }

  async function loadFolder(folder: ExplorerItem) {
    const [childrenResponse, breadcrumbResponse] = await Promise.all([
      folderApi.getChildren(folder.id),
      folderApi.getBreadcrumb(folder.id),
    ]);

    const mappedItems = childrenResponse.data.items.map(withUiState);

    children.value = mappedItems.sort((a: any, b: any) => {
      return b.type.localeCompare(a.type);
    });

    breadcrumb.value = breadcrumbResponse.data;
  }

  // =========================
  // Init
  // =========================

  async function init() {
    const { data } = await folderApi.getChildren("root");

    const mappedRoots = data.items.map(withUiState);

    roots.value = mappedRoots.sort((a: any, b: any) => {
      return b.type.localeCompare(a.type);
    });

    // Ambil folder pertama dari array jika array tidak kosong
    const firstFolder = roots.value[0];

    if (firstFolder) {
      await selectFolder(firstFolder);
    }
  }

  // =========================
  // Navigation
  // =========================

  async function selectFolder(folder: ExplorerItem) {
    // 1. Jika tipe data adalah FILE, buka di tab baru
    if (folder.type === "file") {
      if (folder.url) {
        window.open(folder.url, "_blank", "noopener,noreferrer");
      } else {
        alert("URL file tidak ditemukan.");
      }
      return;
    }

    // 2. Catat riwayat navigasi (History Back/Forward) jika folder berubah
    if (selectedFolder.value && selectedFolder.value.id !== folder.id) {
      history.value.push(selectedFolder.value);
    }

    // 3. Set folder aktif saat ini
    selectedFolder.value = folder;

    // 4. Muat data anak-anak (children) dari folder yang baru dipilih
    await loadFolder(folder);

    // 5. PERBAIKAN UTAMA: Bersihkan input pencarian setelah folder sukses dimuat
    // Panggil useSearchStore di dalam scope fungsi ini untuk menghindari circular dependency
    const { useSearchStore } = await import("./search.store");
    const searchStore = useSearchStore();
    searchStore.clear();
  }

  async function goBack() {
    const previous = history.value.pop();

    if (!previous) {
      return;
    }

    selectedFolder.value = previous;

    await loadFolder(previous);
  }

  // =========================
  // Sidebar tree
  // =========================

  async function toggleFolder(folder: ExplorerItem) {
    folder.expanded = !folder.expanded;

    if (!folder.expanded) {
      return;
    }

    if (folder.loaded) {
      return;
    }

    const { data } = await folderApi.getChildren(folder.id);

    const mappedItems = data.items.map(withUiState);

    // Urutkan berdasarkan ID secara Descending (Besar ke Kecil / Terbaru)
    folder.children = mappedItems.sort((a: any, b: any) => {
      return b.id.localeCompare(a.type);
    });

    folder.loaded = true;
  }

  // =========================
  // Rename
  // =========================

  async function renameFolder(item: ExplorerItem, name: string) {
    const value = name.trim();

    if (!value) {
      return;
    }

    const { data } = await folderApi.rename(item.id, value);

    Object.assign(item, data);

    const crumb = breadcrumb.value.find((b) => b.id === item.id);

    if (crumb) {
      crumb.name = data.name;
    }

    if (selectedFolder.value?.id === item.id) {
      selectedFolder.value.name = data.name;
    }
  }

  // =========================
  // Delete
  // =========================

  async function deleteFolder(item: ExplorerItem) {
    await folderApi.remove(item.id);

    roots.value = roots.value.filter((f) => f.id !== item.id);

    children.value = children.value.filter((f) => f.id !== item.id);

    history.value = history.value.filter((f) => f.id !== item.id);

    if (selectedFolder.value?.id === item.id) {
      selectedFolder.value = null;

      children.value = [];
      breadcrumb.value = [];
    }
  }

  // =========================
  // Create Folder
  // =========================

  async function createFolder(parentId: string | null) {
    const isRoot = !parentId;

    if (!parentId) {
      parentId = "/";
    }

    try {
      const { data } = await folderApi.create({
        name: "New Folder",
        parentId,
      });

      // Pastikan fungsi withUiState memberikan default type jika API backend kosong
      const folder = withUiState(data);
      if (!folder.type) {
        folder.type = "folder"; // Paksa set ke 'folder' jika undefined
      }

      // --- SINKRONISASI SIDEBAR KIRI ---
      if (isRoot) {
        roots.value.push(folder);

        // Defensif Sort
        roots.value.sort((a, b) => {
          const typeA = a.type || "folder";
          const typeB = b.type || "folder";
          return typeB.localeCompare(typeA);
        });
      }

      // --- SINKRONISASI HALAMAN TENGAH ---
      if (selectedFolder.value?.id === parentId) {
        children.value.push(folder);

        // Defensif Sort
        children.value.sort((a, b) => {
          const typeA = a.type || "folder";
          const typeB = b.type || "folder";
          return typeB.localeCompare(typeA);
        });
      }

      // Kembalikan objek folder agar ExplorerPage.vue bisa membuka modal rename
      return folder;
    } catch (error) {
      console.error("Failed to create folder:", error);
      throw error;
    }
  }

  return {
    roots,
    children,
    selectedFolder,
    history,
    breadcrumb,

    withUiState,

    init,
    selectFolder,
    toggleFolder,
    goBack,

    renameFolder,
    deleteFolder,
    createFolder,
  };
});
