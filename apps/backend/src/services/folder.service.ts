// src/services/folder.service.ts

import { FolderRepository } from "../repositories/folder.repository";

export class FolderService {
  constructor(private repository = new FolderRepository()) {}

  getChildren(id: string) {
    return this.repository.findChildren(id);
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  getBreadcrumb(id: string) {
    return this.repository.findBreadcrumb(id);
  }

  // crud operations --------

  //
  async rename(id: string, name: string) {
    if (!name.trim()) {
      throw new Error("Folder name is required");
    }

    return this.repository.rename(id, name.trim());
  }

  async delete(id: string) {
    await this.repository.delete(id);
  }

  async create(name: string, parentId: string | null) {
    if (!name.trim()) {
      throw new Error("Folder name is required");
    }

    return this.repository.create(name.trim(), parentId);
  }
}
