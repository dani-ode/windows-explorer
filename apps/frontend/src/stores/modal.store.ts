// src/stores/modal.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";

import type { ExplorerItem } from "../types/explorer-item";

export const useModalStore = defineStore("modal", () => {
  const renameModal = ref({
    visible: false,
    item: null as ExplorerItem | null,
    name: "",
  });

  const uploadModal = ref({
    visible: false,
    parentId: null as string | null,
  });

  function openRename(item: ExplorerItem) {
    renameModal.value = {
      visible: true,
      item,
      name: item.name,
    };
  }

  function closeRename() {
    renameModal.value = {
      visible: false,
      item: null,
      name: "",
    };
  }

  function openUpload(parentId: string | null = null) {
    uploadModal.value = {
      visible: true,
      parentId,
    };
  }

  function closeUpload() {
    uploadModal.value = {
      visible: false,
      parentId: null,
    };
  }

  return {
    renameModal,
    uploadModal,

    openRename,
    closeRename,

    openUpload,
    closeUpload,
  };
});
