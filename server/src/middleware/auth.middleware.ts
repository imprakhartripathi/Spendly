import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtKey } from "../app.config";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization token missing or malformed" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtKey) as JwtPayload;

    req.user = decoded; // attach payload to request object

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Session expired. Please log in again." });
    } else {
      res.status(401).json({ message: "Invalid or malformed token" });
    }
  }
};
