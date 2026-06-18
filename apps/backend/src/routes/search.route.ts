// routes/search.route.ts

import { Elysia } from "elysia";
import { SearchController } from "../controllers/search.controller";

const controller = new SearchController();

export const searchRoute = new Elysia({
  prefix: "/api/v1/search",
}).get("/", ({ query }) =>
  controller.search(
    query.folderId as string,
    query.q as string,
    Number(query.page ?? 1),
    Number(query.limit ?? 20),
  ),
);
