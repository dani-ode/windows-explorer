// src/stores/context-menu.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";

import type { ExplorerItem } from "../types/explorer-item";

type MenuType = "item" | "folder-list" | "folder-tree";

export const useContextMenuStore = defineStore("context-menu", () => {
  const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,

    type: "item" as MenuType,

    item: null as ExplorerItem | null,
  });

  function openItemMenu(event: MouseEvent, item: ExplorerItem) {
    event.preventDefault();

    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,

      type: "item",

      item,
    };
  }

  function openFolderListMenu(event: MouseEvent) {
    event.preventDefault();

    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,

      type: "folder-list",

      item: null,
    };
  }

  function openFolderTreeMenu(event: MouseEvent) {
    event.preventDefault();

    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,

      type: "folder-tree",

      item: null,
    };
  }

  function close() {
    contextMenu.value.visible = false;
  }

  function toggle(
    event: MouseEvent,
    type: MenuType,
    item: ExplorerItem | null = null,
  ) {
    event.preventDefault();

    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,

      type,
      item,
    };
  }

  return {
    contextMenu,

    openItemMenu,
    openFolderListMenu,
    openFolderTreeMenu,

    close,
    toggle,
  };
});
