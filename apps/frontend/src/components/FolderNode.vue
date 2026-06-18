<!-- src/components/FolderNode.vue -->

<script setup lang="ts">
import type { ExplorerItem } from "../types/explorer-item";
import { useFolderStore } from "../stores/folder.store";
import { useContextMenuStore } from "../stores/context-menu.store";

import FolderNode from "./FolderNode.vue";

defineProps<{
  folder: ExplorerItem;
}>();

const store = useFolderStore();
const menu = useContextMenuStore();

defineOptions({
  name: "FolderNode",
});
</script>

<template>
  <li>
    <div
      class="folder-row"
      @contextmenu.prevent.stop="menu.openItemMenu($event, folder)"
    >
      <span
        v-if="folder.hasChildren"
        class="toggle"
        @click.stop="store.toggleFolder(folder)"
      >
        {{ folder.expanded ? "▼" : "▶" }}
      </span>

      <span v-else class="toggle-placeholder" />

      <span
        class="folder-name"
        :class="{
          active: store.selectedFolder?.id === folder.id,
        }"
        @click="store.selectFolder(folder)"
      >
        <span class="node-icon">
          <template v-if="folder.type === 'folder'"> 📁 </template>

          <template
            v-else-if="
              folder.type === 'file' && folder.mimeType?.startsWith('image/')
            "
          >
            <img
              :src="folder.url"
              :alt="folder.name"
              class="sidebar-preview-img"
            />
          </template>

          <template v-else> 📄 </template>
        </span>

        <span class="text-label">
          {{ folder.name }}{{ folder.type === "file" ? folder.extension : "" }}
        </span>
      </span>
    </div>

    <ul v-if="folder.expanded && folder.children?.length">
      <FolderNode
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
      />
    </ul>
  </li>
</template>

<style scoped>
ul {
  list-style: none;
  padding-left: 18px;
  margin: 0;
}

li {
  margin: 2px 0;
}

.folder-row {
  display: flex;
  align-items: center;
  min-height: 32px;
  margin: 10px;
}

.toggle,
.toggle-placeholder {
  width: 18px;
  flex-shrink: 0;
}

.toggle {
  cursor: pointer;
  user-select: none;
  color: #666;
}

.toggle:hover {
  color: #111;
}

.folder-name {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;
  gap: 6px;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.folder-name:hover {
  background: #f3f4f6;
}

.folder-name.active {
  background: #e5f1fb;
  color: #0a64c9;
  font-weight: 600;
}

/* Container khusus ikon mini di sidebar */
.node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  overflow: hidden;
}

/* Styling thumbnail gambar mini agar pas dengan ukuran teks sidebar */
.sidebar-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
}
</style>
