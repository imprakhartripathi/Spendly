import { Request, Response, NextFunction } from "express";
import User from "../mongodb/schematics/User";
import { assessTransactionAndNotify } from "./budget.assessment.controller";
import { NotificationType } from "../mongodb/schematics/Notifications";
import { TransectionType } from "../mongodb/schematics/Transections";

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
      transection.spentOn,
      new Date().toISOString(),
      NotificationType.Budget,
      transection.transectionType
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
        transection.spentOn,
        new Date().toISOString(),
        NotificationType.Budget,
        transection.transectionType
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

export const searchTransections = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { query, category, type, startDate, endDate } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    let filteredTransections = user.transections;

    // Text search in spentOn and spentOnDesc
    if (query && typeof query === "string") {
      const searchQuery = query.toLowerCase();
      filteredTransections = filteredTransections.filter(
        (t) =>
          t.spentOn.toLowerCase().includes(searchQuery) ||
          t.spentOnDesc.toLowerCase().includes(searchQuery) ||
          t.category.toLowerCase().includes(searchQuery)
      );
    }

    // Filter by category
    if (category && typeof category === "string") {
      filteredTransections = filteredTransections.filter(
        (t) => t.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by transaction type
    if (type && typeof type === "string") {
      filteredTransections = filteredTransections.filter(
        (t) => t.transectionType === type
      );
    }

    // Filter by date range
    if (startDate && typeof startDate === "string") {
      const start = new Date(startDate);
      filteredTransections = filteredTransections.filter(
        (t) => new Date(t.onDate) >= start
      );
    }

    if (endDate && typeof endDate === "string") {
      const end = new Date(endDate);
      filteredTransections = filteredTransections.filter(
        (t) => new Date(t.onDate) <= end
      );
    }

    res.status(200).json({
      transections: filteredTransections,
      count: filteredTransections.length,
    });
  } catch (err) {
    next(err);
  }
};
