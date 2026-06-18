// src/controllers/file.controller.ts

import { FileService } from "../services/file.service";

const service = new FileService();

export class FileController {
  upload(folderId: string, file: File) {
    return service.upload(folderId, file);
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
}
