// src/services/file.service.ts

import { FileRepository } from "../repositories/file.repository";

export class FileService {
  constructor(private repository = new FileRepository()) {}

  async upload(folderId: string, file: File) {
    // Semua logic penanganan file fisik dan DB dipindah ke repo
    return this.repository.upload(folderId, file);
  }

  async rename(id: string, name: string) {
    if (!name.trim()) {
      throw new Error("Folder name is required");
    }

    return this.repository.rename(id, name.trim());
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
