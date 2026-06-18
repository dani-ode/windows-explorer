// src/app.ts

import { Elysia } from "elysia";
import { folderRoute } from "./routes/folder.route";
import { searchRoute } from "./routes/search.route";
import { fileRoute } from "./routes/file.route";

import { staticPlugin } from "@elysia/static";

export const app = new Elysia()
  .use(folderRoute)
  .use(searchRoute)
  .use(fileRoute)
  .use(staticPlugin())
  .get("/health", () => ({
    success: true,
  }));
