import express from "express";
import { checkTokenExpiry, login, sendUserInfo, signup } from "./controllers/auth.controller";

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
