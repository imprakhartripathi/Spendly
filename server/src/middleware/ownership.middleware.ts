import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export const requireSelf = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.params.id;
  const requesterId = req.user?.id;

  if (!requesterId || userId !== requesterId) {
    res.status(403).json({ message: "Forbidden: You are not authorized to access this resource." });
    return;
  }

  next();
};
