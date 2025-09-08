import z from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const loginSchema = signupSchema.omit({ name: true });
