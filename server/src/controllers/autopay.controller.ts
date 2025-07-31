import { Request, Response, NextFunction } from "express";
import User from "../mongodb/schematics/User";
import { TransectionType } from "../mongodb/schematics/Transections";
import { NotificationType } from "../mongodb/schematics/Notifications";
import cron from "node-cron";

// Process autopay transactions - runs daily at midnight
export const processAutopayTransactions = async (): Promise<void> => {
  try {
    console.log("Processing autopay transactions...");
    
    const users = await User.find({
      "transections.isAutopay": true,
      tier: { $in: ["premium"] } // Only premium users can have autopay
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      const autopayTransactions = user.transections.filter(t => t.isAutopay && t.reoccurance > 0);
      
      for (const transaction of autopayTransactions) {
        const lastDate = new Date(transaction.onDate);
        const daysSinceLastTransaction = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if it's time for the next autopay
        if (daysSinceLastTransaction >= transaction.reoccurance) {
          // Create new transaction
          const newTransaction = {
            transectionType: transaction.transectionType,
            amount: transaction.amount,
            spentOn: transaction.spentOn,
            spentOnDesc: `${transaction.spentOnDesc} (Auto-generated)`,
            onDate: today,
            category: transaction.category,
            isAutopay: false, // The generated transaction is not autopay itself
            reoccurance: 0
          };

          user.transections.push(newTransaction as any);

          // Update the original autopay transaction's date
          transaction.onDate = today;

          // Add notification
          user.notifications.push({
            title: "Autopay Transaction Processed",
            desc: `₹${transaction.amount} has been automatically ${transaction.transectionType === TransectionType.Debit ? 'debited' : 'credited'} for ${transaction.spentOn}`,
            type: NotificationType.Sys,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any);

          console.log(`Processed autopay for user ${user.email}: ${transaction.spentOn} - ₹${transaction.amount}`);
        }
      }

      await user.save();
    }

    console.log("Autopay processing completed");
  } catch (error) {
    console.error("Error processing autopay transactions:", error);
  }
};

// Setup autopay reminders - runs daily at 9 AM
export const sendAutopayReminders = async (): Promise<void> => {
  try {
    console.log("Sending autopay reminders...");
    
    const users = await User.find({
      "transections.isAutopay": true,
      tier: { $in: ["premium"] },
      notificationsOn: true
    });

    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + 5); // 5 days ahead

    for (const user of users) {
      const autopayTransactions = user.transections.filter(t => t.isAutopay && t.reoccurance > 0);
      
      for (const transaction of autopayTransactions) {
        const lastDate = new Date(transaction.onDate);
        const nextDueDate = new Date(lastDate);
        nextDueDate.setDate(lastDate.getDate() + transaction.reoccurance);
        
        // Check if autopay is due in 5 days
        if (nextDueDate.toDateString() === reminderDate.toDateString()) {
          user.notifications.push({
            title: "Upcoming Autopay Reminder",
            desc: `₹${transaction.amount} will be automatically ${transaction.transectionType === TransectionType.Debit ? 'debited' : 'credited'} for ${transaction.spentOn} on ${nextDueDate.toLocaleDateString()}`,
            type: NotificationType.Sys,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any);
        }
      }

      await user.save();
    }

    console.log("Autopay reminders sent");
  } catch (error) {
    console.error("Error sending autopay reminders:", error);
  }
};

// API endpoints for autopay management
export const getAutopayTransactions = async (
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

    if (user.tier !== "premium") {
      res.status(403).json({ message: "Autopay feature is only available for Premium users" });
      return;
    }

    const autopayTransactions = user.transections.filter(t => t.isAutopay);
    
    res.status(200).json({ 
      autopayTransactions,
      count: autopayTransactions.length 
    });
  } catch (err) {
    next(err);
  }
};

export const createAutopayTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const transactionData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.tier !== "premium") {
      res.status(403).json({ message: "Autopay feature is only available for Premium users" });
      return;
    }

    // Validate required fields for autopay
    if (!transactionData.reoccurance || transactionData.reoccurance <= 0) {
      res.status(400).json({ message: "Reoccurrence period is required for autopay transactions" });
      return;
    }

    const autopayTransaction = {
      ...transactionData,
      isAutopay: true,
      onDate: new Date(transactionData.onDate || new Date())
    };

    user.transections.push(autopayTransaction);
    await user.save();

    // Add confirmation notification
    user.notifications.push({
      title: "Autopay Setup Complete",
      desc: `Autopay has been set up for ${transactionData.spentOn} - ₹${transactionData.amount} every ${transactionData.reoccurance} days`,
      type: NotificationType.Sys,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    await user.save();

    res.status(201).json({
      message: "Autopay transaction created successfully",
      transaction: autopayTransaction
    });
  } catch (err) {
    next(err);
  }
};

export const updateAutopayTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const transactionId = req.query.transactionId as string;
    const updates = req.body;

    if (!transactionId) {
      res.status(400).json({ message: "transactionId query parameter is required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.tier !== "premium") {
      res.status(403).json({ message: "Autopay feature is only available for Premium users" });
      return;
    }

    const transaction = user.transections.find(
      t => t._id.toString() === transactionId && t.isAutopay
    );

    if (!transaction) {
      res.status(404).json({ message: "Autopay transaction not found" });
      return;
    }

    Object.assign(transaction, updates);
    await user.save();

    res.status(200).json({ 
      message: "Autopay transaction updated successfully", 
      transaction 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAutopayTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const transactionId = req.query.transactionId as string;

    if (!transactionId) {
      res.status(400).json({ message: "transactionId query parameter is required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const transactionIndex = user.transections.findIndex(
      t => t._id.toString() === transactionId && t.isAutopay
    );

    if (transactionIndex === -1) {
      res.status(404).json({ message: "Autopay transaction not found" });
      return;
    }

    const deletedTransaction = user.transections[transactionIndex];
    user.transections.splice(transactionIndex, 1);

    // Add notification
    user.notifications.push({
      title: "Autopay Cancelled",
      desc: `Autopay for ${deletedTransaction.spentOn} has been cancelled`,
      type: NotificationType.Sys,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    await user.save();

    res.status(200).json({ message: "Autopay transaction deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Initialize cron jobs
export const initializeAutopayJobs = (): void => {
  // Process autopay transactions daily at midnight
  cron.schedule('0 0 * * *', processAutopayTransactions);
  
  // Send autopay reminders daily at 9 AM
  cron.schedule('0 9 * * *', sendAutopayReminders);
  
  console.log("Autopay cron jobs initialized");
};