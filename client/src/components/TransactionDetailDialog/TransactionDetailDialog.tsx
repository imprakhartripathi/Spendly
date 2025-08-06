import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import TransactionForm from "../TransactionForm/TransactionForm";
import Portal from "../Portal/Portal";
import { disableBodyScroll, enableBodyScroll } from "../../utils/bodyScrollLock";
import "./TransactionDetailDialog.scss";

interface Transaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  spentOn: string;
  spentOnDesc: string;
  onDate: string;
  category: string;
  isAutopay?: boolean;
  reoccurance?: number;
}

interface TransactionDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  userId: string;
  onUpdate: () => void;
}

const TransactionDetailDialog: React.FC<TransactionDetailDialogProps> = ({
  isOpen,
  onClose,
  transaction,
  userId,
  onUpdate
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      disableBodyScroll();
    } else {
      enableBodyScroll();
    }

    return () => {
      enableBodyScroll();
    };
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${backendURL}/user/${userId}/delete/transection?transectionId=${transaction._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete transaction");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    onUpdate();
    onClose();
  };

  return (
    <>
      <Portal>
        <motion.div 
          className="transaction-detail-overlay modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
        <motion.div 
          className="transaction-detail-modal"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="detail-header">
            <div className="header-content">
              <div className="transaction-type-icon">
                <div className={`icon-wrapper ${transaction.transectionType}`}>
                  {transaction.transectionType === 'debit' ? 
                    <ArrowDownRight size={24} /> : 
                    <ArrowUpRight size={24} />
                  }
                </div>
              </div>
              <div className="header-info">
                <h2>{transaction.spentOn}</h2>
                <div className={`transaction-amount ${transaction.transectionType}`}>
                  {transaction.transectionType === 'debit' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="detail-content">
            <div className="detail-section">
              <div className="detail-item">
                <div className="detail-label">
                  <FileText size={16} />
                  Description
                </div>
                <div className="detail-value">{transaction.spentOnDesc}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <Calendar size={16} />
                  Date
                </div>
                <div className="detail-value">{formatDate(transaction.onDate)}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <Tag size={16} />
                  Category
                </div>
                <div className="detail-value">
                  <span className="category-tag">{transaction.category}</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <DollarSign size={16} />
                  Type
                </div>
                <div className="detail-value">
                  <span className={`type-badge ${transaction.transectionType}`}>
                    {transaction.transectionType === 'debit' ? 'Expense' : 'Income'}
                  </span>
                </div>
              </div>

              {transaction.isAutopay && (
                <div className="detail-item">
                  <div className="detail-label">
                    <Tag size={16} />
                    AutoPay
                  </div>
                  <div className="detail-value">
                    <span className="autopay-badge">Recurring Payment</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <div className="detail-actions">
              <button 
                className="edit-btn"
                onClick={() => setShowEditForm(true)}
              >
                <Edit size={16} />
                Edit Transaction
              </button>
              <button 
                className="delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </Portal>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Portal>
          <motion.div 
            className="delete-confirm-overlay modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
          <motion.div 
            className="delete-confirm-modal"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="confirm-header">
              <div className="warning-icon">
                <AlertTriangle size={24} />
              </div>
              <h3>Delete Transaction</h3>
            </div>
            <div className="confirm-content">
              <p>Are you sure you want to delete this transaction?</p>
              <div className="transaction-preview">
                <strong>{transaction.spentOn}</strong>
                <span className={transaction.transectionType}>
                  {transaction.transectionType === 'debit' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="confirm-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Transaction'}
              </button>
            </div>
          </motion.div>
          </motion.div>
        </Portal>
      )}

      {/* Edit Form */}
      <TransactionForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setError(""); // Clear any errors when closing edit form
        }}
        onSuccess={handleEditSuccess}
        transaction={transaction}
        userId={userId}
        isAutopay={transaction.isAutopay}
      />
    </>
  );
};

export default TransactionDetailDialog;