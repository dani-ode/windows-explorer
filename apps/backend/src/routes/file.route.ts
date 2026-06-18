// src/routes/file.route.ts

import { Elysia, t } from "elysia";
import { FileController } from "../controllers/file.controller";

const controller = new FileController();

export const fileRoute = new Elysia({
  prefix: "/api/v1/files",
})

  .post(
    "/upload",
    ({ body }) => {
      return controller.upload(body.folderId, body.file);
    },
    {
      body: t.Object({
        folderId: t.String(),
        file: t.File(),
      }),
    },
  )
  .patch("/:id", ({ params, body }) =>
    controller.rename(params.id, body as { name: string }),
  )

  .delete("/:id", ({ params }) => {
    return controller.delete(params.id);
  });
