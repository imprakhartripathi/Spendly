// src/components/Authenticator.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import { backendURL } from "../../app.config";
import axios from "axios";
import DOMPurify from "dompurify";
import "./Authenticator.scss";
import logo from "../../assets/logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const MotionPaper = motion(Paper);

export const Authenticator: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const navType = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (navType?.type === "back_forward") {
      window.location.reload();
    }
  }, []);

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const sanitizeInput = (value: string) =>
    DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setForm({ ...form, [e.target.name]: sanitized });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isSignup ? "/signup" : "/login";
    const payload = isSignup
      ? {
          fullName: sanitizeInput(form.fullName),
          email: sanitizeInput(form.email),
          password: sanitizeInput(form.password),
        }
      : {
          email: sanitizeInput(form.email),
          password: sanitizeInput(form.password),
        };

    try {
      const res = await axios.post(`${backendURL}${endpoint}`, payload);
    //   console.log(res);
      const token = res.data.token;
      const name = res.data.user.fullName;
        const session = res.data.timeout;
        let message = `Welcome ${name}, your session is valid for ${session}`;

        if (session === 'never') {
            message = `Welcome ${name}, your session has infinite validity`;
        }

      localStorage.setItem("token", token);
      setSnackbar({
        open: true,
        message: message,
      });

      // Redirect after a small delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong!";
      setSnackbar({ open: true, message });
    }
  };

  const toggleMode = () => {
    setForm({ fullName: "", email: "", password: "" });
    setIsSignup((prev) => !prev);
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
              required
              margin="normal"
              value={form.fullName}
              onChange={handleChange}
              className="auth-input"
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
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            margin="normal"
            value={form.password}
            onChange={handleChange}
            className="auth-input"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
                onClick={toggleMode}
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
                onClick={toggleMode}
                className="auth-toggle-btn"
              >
                Switch to Sign up
              </button>
            </>
          )}
        </Typography>
      </MotionPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
};
