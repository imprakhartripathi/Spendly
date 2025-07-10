import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User, { Tier, Expiration } from "../mongodb/schematics/User";

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // List of fields the user is allowed to update
    const allowedFields = [
      "fullName",
      "email",
      "password",
      "income",
      "monthlyBudget",
      "tier",
      "sessionTimeOut",
      "notificationsOn",
      "emailNotificationsOn",
    ];

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Email update: check for duplicates & normalize
    if (updates.email && updates.email !== user.email) {
      const emailExists = await User.findOne({ email: updates.email.toLowerCase() });
      if (emailExists) {
        res.status(409).json({ message: "Email already in use." });
        return;
      }
      updates.email = updates.email.toLowerCase();
    }

    // Password update: hash if it's being changed
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Optional: Enum validation
    if (updates.tier && !Object.values(Tier).includes(updates.tier)) {
      res.status(400).json({ message: "Invalid tier option." });
      return;
    }

    if (
      updates.sessionTimeOut &&
      !Object.values(Expiration).includes(updates.sessionTimeOut)
    ) {
      res.status(400).json({ message: "Invalid session timeout value." });
      return;
    }

    // Apply only allowed updates
    allowedFields.forEach((field) => {
      if (field in updates) {
        (user as any)[field] = updates[field];
      }
    });

    const updatedUser = await user.save();

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    res.status(200).json({
      message: "User updated successfully.",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User deleted successfully.",
    });


  } catch (error) {
    next(error);
  }
};
