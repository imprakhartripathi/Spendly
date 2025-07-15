import { Request, Response, NextFunction } from "express";
import User from "../mongodb/schematics/User";

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
    // const { userId, transectionId } = req.params;
    const userId = req.params.id;
    const transectionId = req.params.transectionId;
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
    const transectionId = req.params.transectionId;
    const updates = req.body;

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

    Object.assign(transection, updates);
    await user.save();

    res.status(200).json({ message: "Transection updated", transection });
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
    const transectionId = req.params.transectionId;
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
