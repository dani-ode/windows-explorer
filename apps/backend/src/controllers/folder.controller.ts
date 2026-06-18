// src/controllers/folder.controller.ts

import { FolderService } from "../services/folder.service";

const service = new FolderService();

export class FolderController {
  getChildren(id: string) {
    return service.getChildren(id);
  }

  getById(id: string) {
    return service.getById(id);
  }
  getBreadcrumb(id: string) {
    return service.getBreadcrumb(id);
  }

  rename(
    id: string,
    body: {
      name: string;
    },
  ) {
    return service.rename(id, body.name);
  }

  delete(id: string) {
    return service.delete(id);
  }

  create(body: { name: string; parentId: string | null }) {
    return service.create(body.name, body.parentId);
  }
}
