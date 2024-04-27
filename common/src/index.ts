import z from "zod";

// auth validations
export const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.optional(z.string()),
});

export type SignupInput = z.infer<typeof signupInput>;

export const signinInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SigninInput = z.infer<typeof signinInput>;

// blog validations
export const createBlogInput = z.object({
  title: z.string(),
  content: z.string(),
});

export type CreateBlogInput = z.infer<typeof createBlogInput>;

export const updateBlogInput = z.object({
  title: z.string(),
  content: z.string(),
  id: z.string().uuid(),
});

export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
