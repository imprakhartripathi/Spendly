import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

    const token = jwt.sign({ email }, jwtKey);
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

    const token = jwt.sign({ email }, jwtKey);
    const loginTime = generateISTTimestamp();

    await sendWelcomeEmail(
      user.fullName,
      email,
      loginTime,
      NotificationType.Auth
    );

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};
