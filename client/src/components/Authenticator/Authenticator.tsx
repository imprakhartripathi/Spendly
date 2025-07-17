import React, { useState } from "react";
import { TextField, Snackbar, IconButton, InputAdornment } from "@mui/material";
import { motion } from "framer-motion";
import { backendURL } from "../../app.config";
import axios from "axios";
import DOMPurify from "dompurify";
import "./Authenticator.scss";
import logo from "../../assets/logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

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

      const message = `Welcome ${res.data.user.fullName}`;
      setSnackbar({ open: true, message });

      setTimeout(() => {
        navigate(isSignup ? "/pay" : "/dashboard");
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
    <div className="auth-container">
  <div className="auth-base-card">
    <div className="logo-wrapper">
      <img src={logo} alt="Spendly Logo" />
    </div>

    <motion.div
      className="auth-layer-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2>{isSignup ? "Create Your Account" : "Login to Spendly"}</h2>

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <TextField
            label="Full Name"
            name="fullName"
            fullWidth
            required
            margin="normal"
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
          margin="normal"
          value={form.email}
          onChange={handleChange}
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
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? (isSignup ? "Signing Up..." : "Logging In...") : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <p className="auth-toggle">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={toggleMode}>{isSignup ? "Login Here" : "Sign Up"}</button>
      </p>
    </motion.div>
  </div>

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
