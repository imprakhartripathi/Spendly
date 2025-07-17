import { Request, Response } from "express";
import { calculateExpiryTimestamp, PlusID, PremiumID, razorpayInstance } from "../app.config";
import crypto from "crypto";
import User, { Tier } from "../mongodb/schematics/User";

const PLAN_IDS: Record<Tier, string> = {
  free: "", 
  plus: PlusID, 
  premium: PremiumID,
};

// Create Subscription instead of Order
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  // console.log("createSubscription called with body:", req.body);

  try {
    const { tier } = req.body;
    if (!["plus", "premium"].includes(tier)) {
      console.warn(`Invalid tier attempted: ${tier}`);
      res.status(400).json({ message: "Invalid tier. Only plus or premium is allowed." });
      return;
    }

    const planId = PLAN_IDS[tier as Tier];
    if (!planId) {
      res.status(400).json({ message: "No plan ID configured for this tier." });
      return;
    }

    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // example: yearly, 12 months
    });

    // console.log("Razorpay subscription created:", subscription);
    res.status(201).json(subscription);
  } catch (err) {
    console.error("Error in createSubscription:", err);
    res.status(500).json({ message: "Failed to create Razorpay subscription" });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  // console.log("verifyPayment called with body:", req.body);

  try {
    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, tier } = req.body;
    const userId = req.params.id;

    // console.log("Verifying payment for userId:", userId);

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_payment_id + "|" + razorpay_subscription_id)
      .digest("hex");

    // console.log("Generated signature:", generated_signature);
    // console.log("Provided signature:", razorpay_signature);

    if (generated_signature !== razorpay_signature) {
      console.warn("Payment signature mismatch");
      res.status(400).json({ message: "Invalid payment signature" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn(`User not found for ID: ${userId}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.paymentId = razorpay_payment_id;
    user.subscriptionId = razorpay_subscription_id;
    user.tier = tier;
    user.expiresAt = calculateExpiryTimestamp();

    await user.save();
    // console.log("User subscription updated successfully");

    res.json({ message: "Payment verified and subscription updated", tier: user.tier });
  } catch (err) {
    console.error("Error in verifyPayment:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    // console.log("Cancelling subscription for userId:", userId);

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.subscriptionId) {
      // console.log("Cancelling Razorpay subscription:", user.subscriptionId);
      await razorpayInstance.subscriptions.cancel(user.subscriptionId);
    } else {
      console.log("No Razorpay subscription to cancel.");
    }

    user.tier = Tier.Free;
    user.paymentId = null;
    user.subscriptionId = null;
    user.expiresAt = null;

    await user.save();
    // console.log("User downgraded to free tier.");

    res.status(200).json({ message: "Subscription cancelled and downgraded to Free." });
  } catch (err) {
    console.error("Failed to cancel subscription:", err);
    res.status(500).json({ message: "Failed to cancel subscription" });
  }
};
