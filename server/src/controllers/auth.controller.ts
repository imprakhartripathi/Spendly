import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../mongodb/schematics/User";
import { generateISTTimestamp, jwtKey } from "../app.config";
import { sendWelcomeEmail, sendLoginEmail } from "../services/email.service";
import { NotificationType } from "../mongodb/schematics/Notifications";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const jwtOptions =
      newUser.sessionTimeOut === "never"
        ? {}
        : { expiresIn: newUser.sessionTimeOut };

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      jwtKey,
      jwtOptions
    );

    const signupTime = generateISTTimestamp();
    await sendWelcomeEmail(fullName, email, signupTime, NotificationType.Auth);

    // Remove sensitive info before sending response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: "Signup successful",
      token,
      user: userWithoutPassword,
    });
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

    const jwtOptions =
      user.sessionTimeOut === "never" ? {} : { expiresIn: user.sessionTimeOut };
    const token = jwt.sign({ email, id: user._id }, jwtKey, jwtOptions);
    const loginTime = generateISTTimestamp();

    await sendLoginEmail(
      user.fullName,
      email,
      loginTime,
      NotificationType.Auth
    );

    // Remove sensitive info before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      token: token,
      user: userWithoutPassword,
      timeout: user.sessionTimeOut,
      message: "Login Successful",
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
        expiresIn: "No expiration (infinite validity)",
      });
    }
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      const decoded = jwt.decode(error.expiredAt) as JwtPayload;
      res.status(401).json({
        message: "Session expired. Please log in again.",
        expiredAt: error.expiredAt,
      });
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  }
};

export const sendUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization token missing or malformed" });
      return;
    }

    const token = authHeader.split(" ")[1]; // Extract the token part after "Bearer"

    // Verify the token
    const decoded = jwt.verify(token, jwtKey) as { email?: string };

    if (!decoded?.email) {
      res.status(401).json({ message: "Invalid token or email not found" });
      return;
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      user: userWithoutPassword,
    });

  } catch (error) {
    // console.error("sendUserInfo error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

