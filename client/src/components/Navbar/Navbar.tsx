import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import TransactionForm from "../TransactionForm/TransactionForm";
import NotificationsDialog from "../NotificationsDialog/NotificationsDialog";
import SearchAutocomplete from "../SearchAutocomplete/SearchAutocomplete";
import TransactionDetailDialog from "../TransactionDetailDialog/TransactionDetailDialog";
import "./Navbar.scss";

interface NavbarProps {
  user: any;
  onRefresh?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onRefresh }) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendURL}/user/${user._id}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const handleTransactionSuccess = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleTransactionSelect = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const handleTransactionUpdate = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  if (!user) return null;

  return (
    <>
      <motion.header 
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="navbar-left">
          <div className="navbar-content">
            <h1>Welcome back, {user.fullName.split(' ')[0]}!</h1>
            <p>Here's what's happening with your finances today.</p>
          </div>
        </div>
        <div className="navbar-right">
          <SearchAutocomplete 
            user={user}
            onTransactionSelect={handleTransactionSelect}
          />
          <motion.button 
            className="notification-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </motion.button>
          <motion.button 
            className="add-transaction-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTransactionForm(true)}
          >
            {/* <Plus size={16} /> */}
            Add Transaction
          </motion.button>
        </div>
      </motion.header>

      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSuccess={() => {
          handleTransactionSuccess();
          setShowTransactionForm(false);
        }}
        userId={user._id}
      />

      <NotificationsDialog
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userId={user._id}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />

      <TransactionDetailDialog
        isOpen={showTransactionDetail}
        onClose={() => setShowTransactionDetail(false)}
        transaction={selectedTransaction}
        userId={user._id}
        onUpdate={handleTransactionUpdate}
      />
    </>
  );
};

export default Navbar;