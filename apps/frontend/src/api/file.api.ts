// src/api/file.api.ts

import { api } from "./client";

export const fileApi = {
  rename(id: string, name: string) {
    return api.patch(`/v1/files/${id}`, {
      name,
    });
  },

  remove(id: string) {
    return api.delete(`/v1/files/${id}`);
  },

  // Mengubah parameter agar menerima objek File dari browser dan folderId
  upload(file: File, folderId: string | null) {
    const formData = new FormData();

    // 'file' di sini harus sesuai dengan nama field yang diekspektasikan backend (misal: Multer / Express)
    formData.append("file", file);

    if (folderId) {
      formData.append("folderId", folderId);
    }

    return api.post("/v1/files/upload", formData, {
      headers: {
        // Memastikan header di-set ke multipart/form-data
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
