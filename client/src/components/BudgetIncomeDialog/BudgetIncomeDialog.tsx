import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { X, TrendingUp, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./BudgetIncomeDialog.scss";

interface BudgetIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
  type: "budget" | "income";
}

const BudgetIncomeDialog: React.FC<BudgetIncomeDialogProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
  type,
}) => {
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      setValue(
        type === "budget" 
          ? (user.monthlyBudget || "").toString()
          : (user.income || "").toString()
      );
      setError("");
    }
  }, [isOpen, user, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setError("Please enter a valid positive number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const updateData = type === "budget" 
        ? { monthlyBudget: numValue }
        : { income: numValue };

      await axios.patch(
        `${backendURL}/user/edit/${user._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const title = type === "budget" ? "Monthly Budget" : "Monthly Income";
  const icon = type === "budget" ? <Target size={24} /> : <TrendingUp size={24} />;
  const placeholder = type === "budget" ? "Enter your monthly budget" : "Enter your monthly income";

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            component: motion.div,
            initial: { opacity: 0, scale: 0.9, y: 50 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 50 },
            transition: { duration: 0.3 },
          }}
        >
          <DialogTitle className="dialog-title">
            <Box display="flex" alignItems="center" gap={2}>
              <div className="title-icon">
                {icon}
              </div>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Set {title}
              </Typography>
              <IconButton
                onClick={handleClose}
                disabled={loading}
                size="small"
              >
                <X size={20} />
              </IconButton>
            </Box>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent className="dialog-content">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {type === "budget" 
                  ? "Set your monthly spending budget to track your expenses better."
                  : "Set your monthly income to get better financial insights."
                }
              </Typography>

              <TextField
                label={title}
                type="number"
                fullWidth
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                error={!!error}
                helperText={error}
                disabled={loading}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                sx={{ mb: 2 }}
              />

              {type === "budget" && user.monthlyBudget > 0 && (
                <Box className="current-value">
                  <Typography variant="body2" color="text.secondary">
                    Current budget: ₹{user.monthlyBudget.toLocaleString()}
                  </Typography>
                </Box>
              )}

              {type === "income" && user.income > 0 && (
                <Box className="current-value">
                  <Typography variant="body2" color="text.secondary">
                    Current income: ₹{user.income.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions className="dialog-actions">
              <Button
                onClick={handleClose}
                disabled={loading}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !value.trim()}
                variant="contained"
                className="save-button"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default BudgetIncomeDialog;