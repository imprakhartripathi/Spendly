import { Request, Response, NextFunction } from "express";
import User from "../mongodb/schematics/User";
import { assessTransactionAndNotify } from "./budget.assessment.controller";
import { NotificationType } from "../mongodb/schematics/Notifications";

export const createTransection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const transection = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.transections.push(transection);
    await user.save();

    res.status(201).json({
      message: "Transection created",
      transections: user.transections,
    });

    assessTransactionAndNotify(
      user.fullName,
      user.email,
      transection.amount,
      user.income,
      transection.spentOn,
      new Date().toISOString(),
      NotificationType.Budget
    );
  } catch (err) {
    next(err);
  }
};

export const getAllTransections = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ transections: user.transections });
  } catch (err) {
    next(err);
  }
};

export const getTransectionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const transectionId = req.query.transectionId as string;

    if (!transectionId) {
      res
        .status(400)
        .json({ message: "transectionId query parameter is required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const transection = user.transections.find(
      (t) => t._id.toString() === transectionId
    );

    if (!transection) {
      res.status(404).json({ message: "Transection not found" });
      return;
    }

    res.status(200).json({ transection });
  } catch (err) {
    next(err);
  }
};

export const updateTransection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const transectionId = req.query.transectionId as string;
    const updates = req.body;

    if (!transectionId) {
      res
        .status(400)
        .json({ message: "transectionId query parameter is required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const transection = user.transections.find(
      (t) => t._id.toString() === transectionId
    );

    if (!transection) {
      res.status(404).json({ message: "Transection not found" });
      return;
    }

    const originalAmount = transection.amount;
    Object.assign(transection, updates);
    await user.save();

    res.status(200).json({ message: "Transection updated", transection });

    if (updates.amount !== undefined && updates.amount !== originalAmount) {
      await assessTransactionAndNotify(
        user.fullName,
        user.email,
        updates.amount,
        user.income,
        transection.spentOn,
        new Date().toISOString(),
        NotificationType.Budget
      );
    }
  } catch (err) {
    next(err);
  }
};

export const deleteTransection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const transectionId = req.query.transectionId as string;

    if (!transectionId) {
      res
        .status(400)
        .json({ message: "transectionId query parameter is required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const exists = user.transections.some(
      (t) => t._id.toString() === transectionId
    );

    if (!exists) {
      res.status(404).json({ message: "Transection not found" });
      return;
    }

    user.transections = user.transections.filter(
      (t) => t._id.toString() !== transectionId
    );

    await user.save();

    res.status(200).json({ message: "Transection deleted" });
  } catch (err) {
    next(err);
  }
};
