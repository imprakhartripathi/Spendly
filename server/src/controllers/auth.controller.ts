import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../mongodb/schematics/User";
import { generateISTTimestamp, jwtKey } from "../app.config";
import { sendWelcomeEmail } from "./notification.controller";
import { NotificationType } from "../mongodb/schematics/Notifications";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const jwtOptions = newUser.sessionTimeOut === "never" ? {} : { expiresIn: newUser.sessionTimeOut };
    const token = jwt.sign({ email }, jwtKey, jwtOptions);
    const signupTime = generateISTTimestamp();

    await sendWelcomeEmail(fullName, email, signupTime, NotificationType.Auth);

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const jwtOptions = user.sessionTimeOut === "never" ? {} : { expiresIn: user.sessionTimeOut };
    const token = jwt.sign({ email }, jwtKey, jwtOptions);
    const loginTime = generateISTTimestamp();

    await sendWelcomeEmail(
      user.fullName,
      email,
      loginTime,
      NotificationType.Auth
    );

    res.status(200).json({
      token: token,
      timeout: user.sessionTimeOut,
      message: "Login Successful"
    });

  } catch (error) {
    next(error);
  }
};

export const checkTokenExpiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtKey) as JwtPayload;

    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = decoded.exp - currentTime;

      res.status(200).json({
        message: "Token is valid",
        expiresIn: `${remainingTime} seconds`,
        readableExpiry: new Date(decoded.exp * 1000).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      });
    } else {
      res.status(200).json({
        message: "Token is valid",
        expiresIn: "No expiration (infinite validity)"
      });
    }

  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      const decoded = jwt.decode(error.expiredAt) as JwtPayload;
      res.status(401).json({
        message: "Session expired. Please log in again.",
        expiredAt: error.expiredAt
      });
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  }
};
