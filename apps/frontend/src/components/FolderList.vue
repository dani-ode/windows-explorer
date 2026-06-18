<!-- src/components/FolderList.vue -->

<script setup lang="ts">
import { computed } from "vue";
import { useFolderStore } from "../stores/folder.store";
import { useContextMenuStore } from "../stores/context-menu.store";
import { useSearchStore } from "../stores/search.store";

const searchStore = useSearchStore();
const store = useFolderStore();
const menuStore = useContextMenuStore();

const visibleItems = computed(() => {
  return searchStore.search.trim() ? searchStore.searchResults : store.children;
});
</script>

<template>
  <div
    class="folder-tree"
    @contextmenu.self="menuStore.openFolderListMenu($event)"
  >
    <template v-if="visibleItems.length">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="folder-item custom-pointer"
        @dblclick="store.selectFolder(item)"
        @contextmenu.prevent.stop="menuStore.openItemMenu($event, item)"
      >
        <div class="folder-icon">
          <template v-if="item.type === 'folder' || item.icon === 'folder'">
            📁
          </template>

          <template
            v-else-if="
              item.type === 'file' && item.mimeType?.startsWith('image/')
            "
          >
            <img :src="item.url" :alt="item.name" class="file-preview-img" />
          </template>

          <template v-else> 📄 </template>
        </div>

        <div class="folder-name">
          {{ item.name }}{{ item.type === "file" ? item.extension : "" }}
        </div>

        <div
          v-if="item.isSearchResult && item.breadcrumb"
          class="search-breadcrumb"
        >
          🔍 {{ item.breadcrumb }}
        </div>
      </div>
    </template>

    <template v-else>
      <div class="empty-state">
        <div class="empty-icon">🗀</div>
        <div class="empty-text">There are no items to display.</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.folder-tree {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 14px;
  padding: 16px;

  align-content: start;
}

/* ITEM */
.folder-item {
  width: 100%;
  min-height: 110px;

  padding: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;

  border-radius: 10px;
  user-select: none;

  background: transparent;

  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
}

.folder-item:hover {
  background: #f3f4f6;
}

.folder-item:active {
  transform: scale(0.96);
}

/* POINTER */
.custom-pointer {
  cursor: pointer;
}

/* ICON */
.folder-icon {
  font-size: 120px;
  line-height: 1;
}
.file-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Agar gambar tidak gepeng dan memenuhi kotak */
  border-radius: 4px; /* Opsional: mempercantik tampilan */
}

/* NAME */
.folder-name {
  width: 100%;
  text-align: center;
  font-size: 13px;

  word-break: break-word;
  overflow-wrap: break-word;

  color: #111827;
}

/* SEARCH PATH */
.search-breadcrumb {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;

  text-align: center;
  line-height: 1.3;

  word-break: break-word;

  background: #eef2ff;
  padding: 2px 6px;
  border-radius: 6px;

  max-width: 100%;
}

/* EMPTY STATE */
.empty-state {
  /* width: 100%;
  height: 100%; */

  /* padding: 60px 20px; */

  /* display: flex; */
  align-items: center;
  justify-content: center;

  color: #6b7280;
  /* make absolute */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: -100px;

  text-align: center;
}

.empty-icon {
  font-size: 56px;
  opacity: 0.4;
}
.empty-text {
  margin-top: 12px;
  font-size: 14px;
  opacity: 0.6;
  color: #6b7280;
  font-style: italic;
}
</style>
