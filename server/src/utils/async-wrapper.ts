import { Request, Response, NextFunction } from "express";

type Fn = (r: Request, rs: Response, n: NextFunction) => unknown;

export const asyncWrapper = (fn: Fn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
