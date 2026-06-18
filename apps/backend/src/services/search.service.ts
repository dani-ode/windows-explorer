// services/search.service.ts

import { SearchRepository } from "../repositories/search.repository";

export class SearchService {
  private repository = new SearchRepository();

  search(folderId: string, keyword: string, page: number, limit: number) {
    return this.repository.search(folderId, keyword, page, limit);
  }
}
