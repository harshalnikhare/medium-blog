import { Hono } from "hono";

import { sign } from "hono/jwt";

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

import type { HonoEnv } from "../types";
import {
  signinInput,
  signupInput,
} from "@harshalnikharetest/common-medium-blog";

const userRouter = new Hono<HonoEnv>().basePath("/user");

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();

    const { success } = signupInput.safeParse(body);

    if (!success) {
      return c.json({ message: "Invalid inputs" }, 400);
    }

    const { id } = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });

    const token = await sign({ id }, c.env.JWT_SECRET);

    return c.json({ jwt: token });
  } catch (err) {
    console.log(err);
    return c.json({ message: "Invalid" }, 400);
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const { success } = signinInput.safeParse(body);

  if (!success) {
    return c.json({ message: "Invalid inputs" }, 400);
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email, password: body.password },
  });

  if (!user) {
    return c.json({ message: "Invalid Creds" }, 403);
  }

  const token = await sign({ id: user.id }, c.env.JWT_SECRET);

  return c.json({ jwt: token });
});

export default userRouter;
