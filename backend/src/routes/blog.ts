import { Hono } from "hono";
import { verify } from "hono/jwt";
import type { HonoEnv, UserId } from "../types";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {
  createBlogInput,
  updateBlogInput,
} from "@harshalnikharetest/common-medium-blog";

const blogRouter = new Hono<HonoEnv>().basePath("/blog");

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Invalid Token" }, 403);
  }

  const token = authHeader.split(" ")[1];

  try {
    const isVerified: UserId = await verify(token, c.env.JWT_SECRET);

    c.set("user", isVerified);
    await next();
  } catch (err) {
    return c.json({ message: "Invalid Token" }, 403);
  }
});

blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const user = c.get("user");

  try {
    const body = await c.req.json();

    const { success } = createBlogInput.safeParse(body);

    if (!success) {
      return c.json({ message: "Invalid inputs" }, 400);
    }

    const createdBlog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: user.id,
      },
    });

    return c.json({ id: createdBlog.id }, 201);
  } catch (err) {
    console.log(err);
    return c.json({ message: "Error Occured In creating Blog" }, 400);
  }
});

blogRouter.put("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { id } = c.req.param();
  try {
    const body = await c.req.json();

    const { success } = updateBlogInput.safeParse(body);

    if (!success) {
      return c.json({ message: "Invalid inputs" }, 400);
    }

    const updatedBlog = await prisma.blog.update({
      data: {
        title: body.title,
        content: body.content,
      },
      where: { id },
    });
    return c.json({ id: updatedBlog.id });
  } catch (err) {
    console.log(err);

    return c.json({ message: "Error Occured In updating Blog" }, 400);
  }
});

// TODO: add pagination
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.blog.findMany();

    return c.json(blogs);
  } catch (err) {
    console.log(err);
    return c.json({ message: "Error Occured In Fetching Blogs" }, 400);
  }
});

blogRouter.get("/:id", async (c) => {
  const { id } = c.req.param();

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return c.json({ message: "Blog not found" }, 404);
    }

    return c.json(blog);
  } catch (err) {
    console.log(err);
    return c.json({ message: "Error Occured In Fetching Blog" }, 400);
  }
});

export default blogRouter;
