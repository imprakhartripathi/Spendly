import React, { useState } from "react";
import { TextField, Snackbar, IconButton, InputAdornment } from "@mui/material";
import { backendURL } from "../../app.config";
import axios from "axios";
import DOMPurify from "dompurify";
import "./Authenticator.scss";
import logo from "../../assets/logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/spendly-auth-bg.jpg";
import { motion, AnimatePresence } from "framer-motion";

const Authenticator: React.FC = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const sanitizeInput = (value: string) =>
    DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: sanitizeInput(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isSignup ? "/signup" : "/login";
    const payload = isSignup
      ? { fullName: form.fullName, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await axios.post(`${backendURL}${endpoint}`, payload);
      localStorage.setItem("token", res.data.token);
      setSnackbar({ open: true, message: `Welcome ${res.data.user.fullName}` });
      setTimeout(() => {
        navigate(isSignup ? "/payment" : "/dashboard");
      }, 1000);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setForm({ fullName: "", email: "", password: "" });
    setIsSignup((prev) => !prev);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <motion.img
          src={logo}
          alt="Spendly Logo"
          className="logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />

        <motion.h1
          key={`heading-${isSignup}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isSignup ? "Join Spendly" : "Heyy!! Welcome Back"}
        </motion.h1>

        <motion.p
          key={`subtitle-${isSignup}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Let's #SpendSmartly with Spendly
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.form
            key={isSignup ? "signup-form" : "login-form"}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {isSignup && (
              <TextField
                label="Full Name"
                name="fullName"
                fullWidth
                required
                value={form.fullName}
                onChange={handleChange}
              />
            )}
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={form.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading
                ? isSignup
                  ? "Signing Up..."
                  : "Logging In..."
                : isSignup
                ? "Sign Up"
                : "Sign In"}
            </button>

            <p className="auth-toggle">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button type="button" onClick={toggleMode}>
                {isSignup ? "Login Here" : "Sign Up"}
              </button>
            </p>
          </motion.form>
        </AnimatePresence>
      </div>

      <motion.div
        className="auth-right"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img src={bg} alt="Illustration" className="illustration" />
      </motion.div>

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

export default Authenticator;
