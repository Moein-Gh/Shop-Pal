import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// In middleware/validate.ts
export const validateParams =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten() });
      return;
    }
    req.params = result.data as Record<string, string>;
    next();
  };
