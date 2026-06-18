// src/index.ts

import { app } from "./app";

app.listen(3000);

console.log(`🚀 Server running on http://localhost:${app.server?.port}`);
