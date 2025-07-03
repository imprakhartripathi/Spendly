// src/components/Authenticator.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { backendURL } from "../../app.config";
import axios from "axios";
import "./Authenticator.scss";

import logo from "../../assets/logo.png";

const MotionPaper = motion(Paper);

export const Authenticator: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isSignup ? "/signup" : "/login";
    const payload = isSignup
      ? form
      : { email: form.email, password: form.password };

    try {
      const response = await axios.post(`${backendURL}${endpoint}`, payload);
      alert(response.data.message || "Success");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="auth-container">
      <MotionPaper
        elevation={6}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-paper"
      >
        <img src={logo} alt="Logo" className="logo" />

        <Typography variant="subtitle1" className="auth-subtitle">
          {isSignup
            ? "Sign up to get started."
            : "Login to continue to your dashboard."}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {isSignup && (
            <TextField
              label="Full Name"
              name="fullName"
              fullWidth
              required={isSignup}
              margin="normal"
              value={form.fullName}
              onChange={handleChange}
              className={`auth-input full-name-input ${
                isSignup ? "visible" : "hidden"
              }`}
            />
          )}
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={form.email}
            onChange={handleChange}
            className="auth-input"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={form.password}
            onChange={handleChange}
            className="auth-input"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="auth-button"
          >
            {isSignup ? "Sign Up" : "Login"}
          </Button>
        </Box>

        <Typography variant="body2" className="auth-toggle">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="auth-toggle-btn"
              >
                Switch to Login
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className="auth-toggle-btn"
              >
                Switch to Sign up
              </button>
            </>
          )}
        </Typography>
      </MotionPaper>
    </div>
  );
};
