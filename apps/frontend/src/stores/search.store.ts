// src/stores/search.store.ts

import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import type { ExplorerItem } from "../types/explorer-item";
import { searchApi } from "../api/search.api";
import { useFolderStore } from "./folder.store";

export const useSearchStore = defineStore("search", () => {
  const folderStore = useFolderStore();

  // =====================
  // State
  // =====================
  const search = ref("");
  const searchResults = ref<ExplorerItem[]>([]);
  const loading = ref(false);

  const visibleItems = computed(() => {
    return search.value.trim() ? searchResults.value : folderStore.children;
  });

  // =====================
  // Search API
  // =====================
  async function searchItems(keyword: string) {
    const q = keyword.trim();

    if (!q) {
      searchResults.value = [];
      return;
    }

    if (!folderStore.selectedFolder) {
      searchResults.value = [];
      return;
    }

    loading.value = true;

    try {
      const { data } = await searchApi.search(
        folderStore.selectedFolder.id,
        q,
        1,
        50,
      );

      // PERBAIKAN: Suntikkan isSearchResult: true ke dalam objek
      const mappedItems = data.items.map((item: any) => {
        return folderStore.withUiState({
          ...item,
          isSearchResult: true, // <-- Paksa true di sini
        });
      });

      searchResults.value = mappedItems.sort((a: any, b: any) => {
        const typeA = a.type || "folder";
        const typeB = b.type || "folder";
        return typeB.localeCompare(typeA);
      });
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  }

  // debounce sederhana biar tidak spam API
  let timeout: ReturnType<typeof setTimeout> | null = null;

  watch(search, (value) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      searchItems(value);
    }, 250);
  });

  // =====================
  // Clear search
  // =====================
  function clear() {
    search.value = "";
    searchResults.value = [];
  }

  return {
    search,
    searchResults,
    loading,
    visibleItems,
    searchItems,
    clear,
  };
});
