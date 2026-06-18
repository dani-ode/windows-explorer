<!-- src/pages/ExplorerPage.vue -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

import ExplorerHeader from "../components/ExplorerHeader.vue";
import FolderTree from "../components/FolderTree.vue";
import FolderList from "../components/FolderList.vue";

import { useFolderStore } from "../stores/folder.store";
import { useFileStore } from "../stores/file.store";
import { useContextMenuStore } from "../stores/context-menu.store";
import { useModalStore } from "../stores/modal.store";

const folderStore = useFolderStore();
const fileStore = useFileStore();
const menuStore = useContextMenuStore();
const modalStore = useModalStore();

// State lokal untuk menampung file yang dipilih di modal
const selectedFileObject = ref<File | null>(null);

// =====================
// INIT
// =====================
onMounted(() => {
  folderStore.init();
});

// =====================
// ACTIONS
// =====================

function handleRename() {
  const item = menuStore.contextMenu.item;
  if (!item) return;
  menuStore.close();
  modalStore.openRename(item);
}

async function submitRename() {
  const modal = modalStore.renameModal;
  if (!modal.item || !modal.name.trim()) return;

  if (modal.item.type === "file") {
    await fileStore.renameFile(modal.item, modal.name);
  } else {
    await folderStore.renameFolder(modal.item, modal.name);
  }
  modalStore.closeRename();
}

async function handleDelete() {
  const item = menuStore.contextMenu.item;
  if (!item) return;

  const ok = window.confirm(`Delete "${item.name}"?`);
  if (!ok) return;

  if (item.type === "file") {
    await fileStore.deleteFile(item);
  } else {
    await folderStore.deleteFolder(item);
  }
  menuStore.close();
}

async function handleAddFolder() {
  const type = menuStore.contextMenu.type;
  const parentId =
    type === "folder-tree" ? null : (folderStore.selectedFolder?.id ?? null);
  const folder = await folderStore.createFolder(parentId);

  menuStore.close();
  if (!folder) return;

  modalStore.openRename(folder);

  setTimeout(() => {
    const input = document.querySelector(".modal input") as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }, 50);
}

function handleUpload() {
  const type = menuStore.contextMenu.type;
  if (type === "folder-list") {
    modalStore.openUpload(folderStore.selectedFolder?.id ?? null);
  }
  if (type === "folder-tree") {
    modalStore.openUpload(null);
  }
  menuStore.close();
}

// Handler saat user memilih file di dalam modal
function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFileObject.value = target.files[0];
  }
}

// Submit file ke server via store
async function submitUpload() {
  if (!selectedFileObject.value) return alert("Pilih file terlebih dahulu!");

  let parentId = modalStore.uploadModal.parentId;
  if (!parentId) {
    parentId = "/";
  }

  await fileStore.uploadFile(selectedFileObject.value, parentId);

  // Reset state dan tutup modal jika sukses
  selectedFileObject.value = null;
  modalStore.closeUpload();
}

// =====================
// RESIZE SIDEBAR
const sidebarWidth = ref(280);
let isResizing = false;

function startResize() {
  isResizing = true;
  document.body.style.cursor = "col-resize";
}

function stopResize() {
  isResizing = false;
  document.body.style.cursor = "default";
}

function handleMouseMove(e: MouseEvent) {
  if (!isResizing) return;
  const min = 200;
  const max = 500;
  const newWidth = e.clientX;

  if (newWidth < min) {
    sidebarWidth.value = min;
    return;
  }
  if (newWidth > max) {
    sidebarWidth.value = max;
    return;
  }
  sidebarWidth.value = newWidth;
}

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", stopResize);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", stopResize);
});
</script>

<template>
  <div class="explorer">
    <ExplorerHeader />

    <div class="content" ref="containerRef">
      <aside
        class="sidebar"
        :style="{ width: sidebarWidth + 'px' }"
        @contextmenu.prevent="menuStore.openFolderTreeMenu($event)"
      >
        <FolderTree />
      </aside>

      <div class="resizer" @mousedown="startResize"></div>

      <main
        class="body-content"
        @contextmenu.prevent="menuStore.openFolderListMenu($event)"
      >
        <FolderList />
      </main>
    </div>

    <div
      v-if="menuStore.contextMenu.visible"
      class="context-menu"
      :style="{
        left: menuStore.contextMenu.x + 'px',
        top: menuStore.contextMenu.y + 'px',
      }"
    >
      <template v-if="menuStore.contextMenu.type === 'item'">
        <div class="menu-item" @click.stop="handleRename">Rename</div>
        <div class="menu-item danger" @click="handleDelete">Delete</div>
      </template>

      <template v-if="menuStore.contextMenu.type === 'folder-list'">
        <div class="menu-item" @click="handleAddFolder">Add Folder</div>
        <div class="menu-item" @click="handleUpload">Upload File</div>
      </template>

      <template v-if="menuStore.contextMenu.type === 'folder-tree'">
        <div class="menu-item" @click="handleAddFolder">Add Folder</div>
        <div class="menu-item" @click="handleUpload">Upload File</div>
      </template>
    </div>

    <div v-if="modalStore.renameModal.visible" class="modal-overlay">
      <div class="modal">
        <h3>
          Rename
          {{ modalStore.renameModal.item?.type === "file" ? "File" : "Folder" }}
        </h3>
        <input
          v-model="modalStore.renameModal.name"
          @keyup.enter="submitRename"
        />
        <div class="actions">
          <button @click="modalStore.closeRename()">Cancel</button>
          <button @click="submitRename">Save</button>
        </div>
      </div>
    </div>

    <div v-if="modalStore.uploadModal.visible" class="modal-overlay">
      <div class="modal">
        <h3>Upload File</h3>

        <input type="file" @change="onFileChange" />

        <div class="actions">
          <button
            @click="modalStore.closeUpload()"
            :disabled="fileStore.isUploading"
          >
            Cancel
          </button>

          <button @click="submitUpload" :disabled="fileStore.isUploading">
            {{ fileStore.isUploading ? "Uploading..." : "Upload" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.content {
  flex: 1;
  display: flex;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  min-width: 200px;
  max-width: 500px;
  border-right: 1px solid #e5e7eb;
  overflow: auto;
}

.body-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.resizer {
  width: 5px;
  cursor: col-resize;
  background: transparent;
}

.resizer:hover {
  background: #e5e7eb;
}

/* popup */
.context-menu {
  position: fixed;
  z-index: 9999;

  min-width: 180px;

  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;

  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);

  padding: 6px;

  animation: fadeIn 0.12s ease;
}

.menu-item {
  padding: 10px 12px;
  font-size: 14px;

  border-radius: 6px;

  cursor: pointer;

  transition: background 0.15s;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background: #fee2e2;
}

/* modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.35);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 10000;
}

/* modal box */
.modal {
  width: 320px;

  background: #ffffff;
  border-radius: 12px;

  padding: 18px;

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);

  animation: scaleIn 0.12s ease;
}

.modal h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.modal input {
  width: 100%;

  padding: 10px 12px;

  border: 1px solid #e5e7eb;
  border-radius: 8px;

  outline: none;
}

.modal input:focus {
  border-color: #2563eb;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
