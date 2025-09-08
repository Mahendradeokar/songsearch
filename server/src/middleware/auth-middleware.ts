import type { Request, Response, NextFunction } from "express";
import { httpErrors } from "@src/service/api-error";
import jwt from "jsonwebtoken";
import { asyncWrapper } from "@src/utils/async-wrapper";

export const authMiddleware = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw httpErrors.unauthorized(
        "Authorization header missing or malformed"
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw httpErrors.unauthorized("Token not found");
    }

    let payload: Record<string, unknown>;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as Record<
        string,
        unknown
      >;
    } catch (err) {
      throw httpErrors.unauthorized("Invalid or expired token");
    }

    res.locals.user = payload;
    next();
  }
);
