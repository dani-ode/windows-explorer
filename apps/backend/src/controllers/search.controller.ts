// controllers/search.controller.ts

import { SearchService } from "../services/search.service";

export class SearchController {
  private service = new SearchService();

  search(folderId: string, q: string, page = 1, limit = 20) {
    return this.service.search(folderId, q, page, limit);
  }
}
