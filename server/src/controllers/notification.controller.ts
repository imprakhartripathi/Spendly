import { Request, Response, NextFunction } from "express";
import User from "../mongodb/schematics/User";

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { limit = 50, offset = 0 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Sort notifications by creation date (newest first)
    const sortedNotifications = user.notifications
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(Number(offset), Number(offset) + Number(limit));

    const unreadCount = user.notifications.filter(n => !n.isRead).length;

    res.status(200).json({ 
      notifications: sortedNotifications,
      unreadCount,
      total: user.notifications.length
    });
  } catch (err) {
    next(err);
  }
};

export const markNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { notificationIds } = req.body; // Array of notification IDs, or empty for all

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      user.notifications.forEach(notification => {
        if (notification._id && notificationIds.includes(notification._id.toString())) {
          notification.isRead = true;
          notification.updatedAt = new Date();
        }
      });
    } else {
      // Mark all notifications as read
      user.notifications.forEach(notification => {
        notification.isRead = true;
        notification.updatedAt = new Date();
      });
    }

    await user.save();

    res.status(200).json({ 
      message: "Notifications marked as read",
      unreadCount: user.notifications.filter(n => !n.isRead).length
    });
  } catch (err) {
    next(err);
  }
};

export const clearNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { olderThanDays = 30 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(olderThanDays));

    const initialCount = user.notifications.length;
    user.notifications = user.notifications.filter(
      notification => notification.createdAt && new Date(notification.createdAt) > cutoffDate
    );

    await user.save();

    const clearedCount = initialCount - user.notifications.length;

    res.status(200).json({ 
      message: `Cleared ${clearedCount} old notifications`,
      remaining: user.notifications.length
    });
  } catch (err) {
    next(err);
  }
};