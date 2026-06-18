// src/api/folder.api.ts

import { api } from "./client";

export const folderApi = {
  // getRoot() {
  //   return api.get("/v1/folders/root/children");
  // },

  getChildren(id: string) {
    return api.get(`/v1/folders/${id}/children`);
  },

  getById(id: string) {
    return api.get(`/v1/folders/${id}`);
  },

  getBreadcrumb(id: string) {
    return api.get(`/v1/folders/${id}/breadcrumb`);
  },

  rename(id: string, name: string) {
    return api.patch(`/v1/folders/${id}`, {
      name,
    });
  },
  remove(id: string) {
    return api.delete(`/v1/folders/${id}`);
  },
  create(payload: { name: string; parentId: string | null }) {
    return api.post("/v1/folders", payload);
  },
};
