import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Repeat,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import TransactionForm from "../../components/TransactionForm/TransactionForm";
import Navbar from "../../components/Navbar/Navbar";
import "./AutoPays.scss";

interface AutoPayTransaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  spentOn: string;
  spentOnDesc: string;
  onDate: string;
  category: string;
  isAutopay: boolean;
  reoccurance: number;
}

const AutoPays: React.FC = () => {
  const { user, refreshUser } = useOutletContext<{
    user: any;
    refreshUser: () => void;
  }>();
  const [autopayTransactions, setAutopayTransactions] = useState<
    AutoPayTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<AutoPayTransaction | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.tier === "premium") {
      fetchAutopayTransactions();
    }
  }, [user]);

  const fetchAutopayTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendURL}/user/${user._id}/autopay`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAutopayTransactions(response.data.autopayTransactions);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch autopay transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAutopay = async (transactionId: string) => {
    if (!confirm("Are you sure you want to cancel this autopay?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${backendURL}/user/${user._id}/autopay?transactionId=${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAutopayTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete autopay");
    }
  };

  const getRecurrenceLabel = (days: number) => {
    switch (days) {
      case 1:
        return "Daily";
      case 7:
        return "Weekly";
      case 14:
        return "Bi-weekly";
      case 30:
        return "Monthly";
      case 90:
        return "Quarterly";
      case 365:
        return "Yearly";
      default:
        return `Every ${days} days`;
    }
  };

  const getNextPaymentDate = (lastDate: string, recurrence: number) => {
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(last.getDate() + recurrence);
    return next;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (user?.tier !== "premium") {
    return (
      <div className="autopays-page">
        <Navbar user={user} onRefresh={refreshUser} />
        <div className="upgrade-notice">
          <AlertCircle size={48} />
          <h2>Premium Feature</h2>
          <p>AutoPay and EMI management is available for Premium users only.</p>
          <button
            className="upgrade-btn"
            onClick={() => (window.location.href = "/payment")}
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="autopays-page">
      <Navbar user={user} onRefresh={refreshUser} />
      <motion.div
        className="autopays-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <CreditCard size={24} />
          <div>
            <h1>AutoPays & EMIs</h1>
            <p>Manage your recurring payments and EMIs</p>
          </div>
        </div>
        <button className="add-autopay-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add AutoPay
        </button>
      </motion.div>

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      <div className="autopays-content">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading autopay transactions...</p>
          </div>
        ) : autopayTransactions.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CreditCard size={48} />
            <h3>No AutoPays Set Up</h3>
            <p>Set up recurring payments to automate your finances</p>
            <button className="setup-btn" onClick={() => setShowForm(true)}>
              <Plus size={16} />
              Set Up First AutoPay
            </button>
          </motion.div>
        ) : (
          <div className="autopays-grid">
            <AnimatePresence>
              {autopayTransactions.map((transaction, index) => {
                const nextPayment = getNextPaymentDate(
                  transaction.onDate,
                  transaction.reoccurance
                );
                const isUpcoming =
                  nextPayment.getTime() - new Date().getTime() <=
                  5 * 24 * 60 * 60 * 1000; // 5 days

                return (
                  <motion.div
                    key={transaction._id}
                    className={`autopay-card ${transaction.transectionType}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="card-header">
                      <div className="transaction-info">
                        <h3>{transaction.spentOn}</h3>
                        <p>{transaction.spentOnDesc}</p>
                      </div>
                      <div className="card-actions">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setShowForm(true);
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteAutopay(transaction._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="amount-section">
                        <div className="amount">
                          <DollarSign size={16} />
                          <span>{formatCurrency(transaction.amount)}</span>
                        </div>
                        <div className="type-badge">
                          {transaction.transectionType === "debit"
                            ? "Expense"
                            : "Income"}
                        </div>
                      </div>

                      <div className="schedule-section">
                        <div className="schedule-item">
                          <Repeat size={14} />
                          <span>
                            {getRecurrenceLabel(transaction.reoccurance)}
                          </span>
                        </div>
                        <div className="schedule-item">
                          <Calendar size={14} />
                          <span>Next: {nextPayment.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="category-section">
                        <span className="category-tag">
                          {transaction.category}
                        </span>
                        {isUpcoming && (
                          <div className="upcoming-indicator">
                            <CheckCircle size={14} />
                            <span>Due Soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <TransactionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(null);
          setError(""); // Clear any errors when closing
        }}
        onSuccess={() => {
          fetchAutopayTransactions();
          setShowForm(false);
          setEditingTransaction(null);
          setError(""); // Clear any errors on success
        }}
        transaction={editingTransaction}
        userId={user._id}
        isAutopay={true}
      />
    </div>
  );
};

export default AutoPays;
