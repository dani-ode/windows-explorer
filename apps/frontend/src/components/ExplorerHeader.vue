<!-- src/components/ExplorerHeader.vue -->

<script setup lang="ts">
import { useFolderStore } from "../stores/folder.store";
import { useSearchStore } from "../stores/search.store";

const folderStore = useFolderStore();
const searchStore = useSearchStore();
</script>

<template>
  <header class="header">
    <button
      class="back-button"
      :disabled="!folderStore.history.length"
      @click="folderStore.goBack"
    >
      ←
    </button>

    <div class="breadcrumb">
      <span class="crumb">/</span>

      <template v-for="(item, index) in folderStore.breadcrumb" :key="item.id">
        <span class="crumb" @click="folderStore.selectFolder(item)">
          {{ item.name }}
        </span>

        <span
          v-if="index < folderStore.breadcrumb.length - 1"
          class="separator"
        >
          /
        </span>
      </template>
    </div>

    <!-- 🔥 FIX DI SINI -->
    <div class="search-wrapper">
      <input
        v-model="searchStore.search"
        :placeholder="`Search in ${folderStore.selectedFolder ? folderStore.selectedFolder.name : 'root'}`"
        class="search-input"
      />
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 56px;
  padding: 0 16px;

  display: flex;
  align-items: center;
  gap: 16px;

  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.back-button {
  width: 36px;
  height: 36px;

  border: none;
  border-radius: 8px;

  background: transparent;
  cursor: pointer;

  font-size: 18px;
}

.back-button:hover:not(:disabled) {
  background: #f3f4f6;
}

.back-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.breadcrumb {
  flex: 1;

  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  background: #ececec;
  padding: 4px 12px;
  border-radius: 8px;
}

.separator {
  color: #9ca3af;
}
.crumb {
  cursor: pointer;
  border-radius: 4px;

  transition: background-color 0.15s;
  font-size: 14px;
  color: #868b92;
}

.breadcrumb span {
  white-space: nowrap;
}

.search-wrapper {
  width: 280px;
}

.search-input {
  width: 100%;
  height: 38px;

  padding: 0 14px;

  border: 1px solid #d1d5db;
  border-radius: 8px;

  outline: none;
  font-size: 14px;
}

.search-input:focus {
  border-color: #2563eb;
}
</style>
