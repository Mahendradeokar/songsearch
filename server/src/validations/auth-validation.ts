import z from "zod";

export const signupValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

export const loginValidationSchema = signupValidationSchema.omit({
  name: true,
});
