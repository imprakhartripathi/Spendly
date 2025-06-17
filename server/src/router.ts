import express from "express";

export const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('Welcome To The Spendlly Backend!!');
  console.log("Root Accessed");
});

router.get('/ping', (req, res) => {
  res.status(200).send('01110000 01101111 01101110 01100111');
  console.log("Everything Good");
});