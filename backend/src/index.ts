import { Hono } from "hono";

import userRouter from "./routes/user";
import blogRouter from "./routes/blog";

const app = new Hono().basePath("/api/v1");

// app.get("/", (c) => {
//   return c.text("Hello Hono!");
// });

app.route("/", userRouter);
app.route("/", blogRouter);

export default app;
