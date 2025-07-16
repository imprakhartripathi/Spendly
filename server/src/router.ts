import express from "express";
import { checkTokenExpiry, login, sendUserInfo, signup } from "./controllers/auth.controller";
import { deleteUser, updateUser } from "./controllers/user.controller";
import { authenticate } from "./middleware/auth.middleware";
import { requireSelf } from "./middleware/ownership.middleware";
import { createTransection, deleteTransection, getAllTransections, getTransectionById, updateTransection } from "./controllers/transection.controller";
import { cancelSubscription, createSubscription, verifyPayment } from "./controllers/razorpay.controller";

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
router.patch("/user/:id/edit/transection", authenticate, requireSelf, updateTransection);
router.delete("/user/:id/delete/transection", authenticate, requireSelf, deleteTransection);
