<!-- src/components/FolderTree.vue -->

<script setup lang="ts">
import { useFolderStore } from "../stores/folder.store";
import FolderNode from "./FolderNode.vue";

const store = useFolderStore();
</script>

<template>
  <div class="folder-tree">
    <ul>
      <FolderNode
        v-for="folder in store.roots"
        :key="folder.id"
        :folder="folder"
      />
    </ul>
  </div>
</template>
