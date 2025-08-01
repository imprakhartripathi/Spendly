import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Repeat,
} from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import Portal from "../Portal/Portal";
import "./TransactionForm.scss";

interface Transaction {
  _id?: string;
  transectionType: "debit" | "credit";
  amount: number;
  spentOn: string;
  spentOnDesc: string;
  onDate: string;
  category: string;
  isAutopay?: boolean;
  reoccurance?: number;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
  userId: string;
  isAutopay?: boolean;
}

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Rent",
  "Insurance",
  "Investment",
  "Salary",
  "Business",
  "Other",
];

const RECURRENCE_OPTIONS = [
  { value: 1, label: "Daily" },
  { value: 7, label: "Weekly" },
  { value: 14, label: "Bi-weekly" },
  { value: 30, label: "Monthly" },
  { value: 90, label: "Quarterly" },
  { value: 365, label: "Yearly" },
];

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  userId,
  isAutopay = false,
}) => {
  const [formData, setFormData] = useState({
    transectionType: "debit",
    amount: "", // store as string to avoid 01000 issue
    spentOn: "",
    spentOnDesc: "",
    onDate: new Date().toISOString().split("T")[0],
    category: "",
    isAutopay: isAutopay,
    reoccurance: isAutopay ? 30 : 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transaction) {
      setFormData({
        transectionType: transaction.transectionType,
        amount: transaction.amount.toString(), // keep as string
        spentOn: transaction.spentOn,
        spentOnDesc: transaction.spentOnDesc,
        onDate: new Date(transaction.onDate).toISOString().split("T")[0],
        category: transaction.category,
        isAutopay: transaction.isAutopay ?? isAutopay,
        reoccurance: transaction.reoccurance ?? (isAutopay ? 30 : 0),
      });
    } else {
      setFormData({
        transectionType: "debit",
        amount: "",
        spentOn: "",
        spentOnDesc: "",
        onDate: new Date().toISOString().split("T")[0],
        category: "",
        isAutopay: isAutopay,
        reoccurance: isAutopay ? 30 : 0,
      });
    }
  }, [transaction, isAutopay]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // no parsing here
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const endpoint = isAutopay
        ? transaction
          ? `/user/${userId}/autopay?transactionId=${transaction._id}`
          : `/user/${userId}/autopay`
        : transaction
        ? `/user/${userId}/edit/transection?transectionId=${transaction._id}`
        : `/user/${userId}/add/transection`;

      const method = transaction ? "patch" : "post";

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount || "0"), // convert here
      };

      await axios[method](`${backendURL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <motion.div
        className="transaction-form-overlay modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="transaction-form-modal"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="form-header">
            <h2>
              {transaction ? "Edit" : "Add"}{" "}
              {isAutopay ? "Autopay" : "Transaction"}
            </h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Tag size={16} />
                  Type
                </label>
                <select
                  name="transectionType"
                  value={formData.transectionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="debit">Expense</option>
                  <option value="credit">Income</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <FileText size={16} />
                Title
              </label>
              <input
                type="text"
                name="spentOn"
                value={formData.spentOn}
                onChange={handleInputChange}
                placeholder="e.g., Grocery Shopping"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FileText size={16} />
                Description
              </label>
              <textarea
                name="spentOnDesc"
                value={formData.spentOnDesc}
                onChange={handleInputChange}
                placeholder="Additional details about this transaction"
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Date
                </label>
                <input
                  type="date"
                  name="onDate"
                  value={formData.onDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Tag size={16} />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isAutopay && (
              <div className="form-group">
                <label>
                  <Repeat size={16} />
                  Recurrence
                </label>
                <select
                  name="reoccurance"
                  value={formData.reoccurance}
                  onChange={handleInputChange}
                  required
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="save-btn">
                <Save size={16} />
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </Portal>
  );
};

export default TransactionForm;
