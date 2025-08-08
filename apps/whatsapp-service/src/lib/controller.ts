/* eslint-disable @typescript-eslint/no-explicit-any */
// src/controllers/base.controller.ts
import type { NextFunction, Request, Response } from "express";

export class BaseController {
  public handle(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        console.error(`[Controller Error] ${req.method} ${req.url}`, error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    };
  }
}

export const createBaseController = () => new BaseController();
