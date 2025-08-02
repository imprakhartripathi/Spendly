import express from "express";
import { checkTokenExpiry, login, sendUserInfo, signup } from "./controllers/auth.controller";
import { deleteUser, updateUser } from "./controllers/user.controller";
import { authenticate } from "./middleware/auth.middleware";
import { requireSelf } from "./middleware/ownership.middleware";
import { createTransection, deleteTransection, getAllTransections, getTransectionById, updateTransection, searchTransections } from "./controllers/transection.controller";
import { getNotifications, markNotificationsAsRead, clearNotifications } from "./controllers/notification.controller";
import { getAutopayTransactions, createAutopayTransaction, updateAutopayTransaction, deleteAutopayTransaction } from "./controllers/autopay.controller";
import { cancelSubscription, createSubscription, verifyPayment } from "./controllers/razorpay.controller";
import { processMonthlySavings, sendMonthlySavingsReminder } from "./controllers/monthly.savings.controller";

export const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('Welcome To The Spendlly Backend!!');
  console.log("Root Accessed");
});

router.get('/ping', (req, res) => {
  res.status(200).send('01110000 01101111 01101110 01100111');
  console.log("Everything Good");
});

router.post('/signup', signup);
router.post('/login', login);
router.get("/check-token", checkTokenExpiry);
router.get("/getuserinfo", sendUserInfo);

router.post("/create-subscription", authenticate, createSubscription);
router.post("/verify-payment/:id", authenticate, requireSelf, verifyPayment);
router.post("/cancel-subs/:id", authenticate, requireSelf, cancelSubscription);


router.patch("/user/edit/:id", authenticate, requireSelf, updateUser); // takes updates via body and id for finding
router.delete("/user/delete/:id", authenticate, requireSelf, deleteUser); // just id

router.post("/user/:id/add/transection", authenticate, requireSelf, createTransection);
router.get("/user/:id/transections", authenticate, requireSelf, getAllTransections);
router.get("/user/:id/transection", authenticate, requireSelf, getTransectionById);
router.get("/user/:id/search/transections", authenticate, requireSelf, searchTransections);
router.patch("/user/:id/edit/transection", authenticate, requireSelf, updateTransection);
router.delete("/user/:id/delete/transection", authenticate, requireSelf, deleteTransection);

// Notification routes
router.get("/user/:id/notifications", authenticate, requireSelf, getNotifications);
router.patch("/user/:id/notifications/read", authenticate, requireSelf, markNotificationsAsRead);
router.delete("/user/:id/notifications/clear", authenticate, requireSelf, clearNotifications);

// Autopay routes (Premium only)
router.get("/user/:id/autopay", authenticate, requireSelf, getAutopayTransactions);
router.post("/user/:id/autopay", authenticate, requireSelf, createAutopayTransaction);
router.patch("/user/:id/autopay", authenticate, requireSelf, updateAutopayTransaction);
router.delete("/user/:id/autopay", authenticate, requireSelf, deleteAutopayTransaction);

// Monthly savings routes (Admin/Testing only)
router.post("/admin/process-monthly-savings", async (req, res) => {
  try {
    await processMonthlySavings();
    res.status(200).json({ message: "Monthly savings processed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error processing monthly savings", error });
  }
});

router.post("/admin/send-savings-reminder", async (req, res) => {
  try {
    await sendMonthlySavingsReminder();
    res.status(200).json({ message: "Monthly savings reminders sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending savings reminders", error });
  }
});
