<!-- src/App.vue -->

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import ExplorerPage from "./pages/ExplorerPage.vue";
import { useContextMenuStore } from "./stores/context-menu.store";

const menuStore = useContextMenuStore();

function handleGlobalClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const menuEl = document.querySelector(".context-menu");

  if (menuEl && menuEl.contains(target)) return;

  menuStore.close();
}

onMounted(() => {
  window.addEventListener("click", handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener("click", handleGlobalClick);
});
</script>

<template>
  <ExplorerPage />
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: Arial, Helvetica, sans-serif;
}

ul {
  list-style: none;
}
</style>
