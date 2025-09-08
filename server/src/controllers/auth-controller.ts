import { Request, Response } from "express";
import { UserModel } from "../models/user-model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncWrapper } from "@src/utils/async-wrapper";
import { httpErrors } from "@src/service/api-error";
import { createResponse } from "@src/utils/create-response";
import type { AuthUser, LoginResponse, SignUpResponse } from "@shared-types";
import { z } from "zod";
import {
  loginValidationSchema,
  signupValidationSchema,
} from "@src/validations/auth-validation";

export const signup = asyncWrapper(async (req: Request, res: Response) => {
  const parseResult = signupValidationSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw httpErrors.badRequest(z.prettifyError(parseResult.error));
  }

  const { name, email, password } = parseResult.data;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw httpErrors.badRequest("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(200).json(
    createResponse<SignUpResponse>({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  );
});

export const login = asyncWrapper(async (req: Request, res: Response) => {
  const parseResult = loginValidationSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw httpErrors.badRequest(z.prettifyError(parseResult.error));
  }

  const { email, password } = parseResult.data;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw httpErrors.unauthorized("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw httpErrors.unauthorized("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.status(200).json(
    createResponse<LoginResponse>({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  );
});

export const getUser = asyncWrapper(async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw httpErrors.notFound("User not found");
  }

  res.status(200).json(
    createResponse<AuthUser>({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
  );
});
