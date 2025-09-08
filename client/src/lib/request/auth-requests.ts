import type { LoginResponse, SignUpResponse, AuthUser } from "@shared-types";
import { API } from "../api-client";
import { z } from "zod";
import type { loginSchema, signupSchema } from "../validations/auth-validation";

export async function signup(payload: z.infer<typeof signupSchema>) {
  return API.makeRequest<SignUpResponse>({
    method: "post",
    url: "auth/signup",
    payload: payload,
  });
}

export async function login(payload: z.infer<typeof loginSchema>) {
  return API.makeRequest<LoginResponse>({
    method: "post",
    url: "auth/login",
    payload: payload,
  });
}

export async function getUser() {
  return API.makeRequest<AuthUser>({
    method: "get",
    url: "auth/user",
  });
}
