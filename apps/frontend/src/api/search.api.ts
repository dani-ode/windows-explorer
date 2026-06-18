// src/api/search.api.ts

import { api } from "./client";

export const searchApi = {
  search(folderId: string, q: string, page = 1, limit = 20) {
    // console.log(folderId, q, page, limit);
    return api.get("/v1/search?" + folderId, {
      params: {
        q,
        page,
        limit,
      },
    });
  },
};
