// src/routes/folder.route.ts

import { Elysia } from "elysia";
import { FolderController } from "../controllers/folder.controller";

const controller = new FolderController();

export const folderRoute = new Elysia({
  prefix: "/api/v1/folders",
})
  .get("/:id", ({ params }) => controller.getById(params.id))
  .get("/:id/children", ({ params }) => controller.getChildren(params.id))
  .get("/:id/breadcrumb", ({ params }) => controller.getBreadcrumb(params.id))
  .post("/", ({ body }) =>
    controller.create(body as { name: string; parentId: string | null }),
  )
  .patch("/:id", ({ params, body }) =>
    controller.rename(params.id, body as { name: string }),
  )
  .delete("/:id", ({ params }) => controller.delete(params.id));
