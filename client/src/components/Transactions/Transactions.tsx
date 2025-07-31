import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Filter, Calendar } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import TransactionDetailDialog from "../TransactionDetailDialog/TransactionDetailDialog";
import "./Transactions.scss";

interface Transaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  category: string;
  spentOn: string;
  spentOnDesc: string;
  onDate: string;
}

const Transactions: React.FC = () => {
  const { user, refreshUser } = useOutletContext<{ user: any; refreshUser: () => void }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterType, sortBy]);

  const fetchTransactions = async () => {
    if (user) {
      setTransactions(user.transections || []);
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((txn: Transaction) => txn.transectionType === filterType);
    }

    // Sort transactions
    filtered.sort((a: Transaction, b: Transaction) => {
      switch (sortBy) {
        case "date":
          return new Date(b.onDate).getTime() - new Date(a.onDate).getTime();
        case "amount":
          return b.amount - a.amount;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const handleTransactionUpdate = () => {
    refreshUser();
    fetchTransactions();
  };

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loader"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="transactions-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar user={user} onRefresh={refreshUser} />
      <div className="transactions-header">
        <div className="header-left">
          <h1>All Transactions</h1>
          <p>Manage and view all your financial transactions</p>
        </div>
        <div className="header-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="debit">Expenses</option>
              <option value="credit">Income</option>
            </select>
          </div>
          <div className="sort-group">
            <Calendar size={16} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div 
        className="transactions-stats"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p className="stat-number">{filteredTransactions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <p className="stat-number expense">
            ₹{filteredTransactions
              .filter((t: Transaction) => t.transectionType === "debit")
              .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Income</h3>
          <p className="stat-number income">
            ₹{filteredTransactions
              .filter((t: Transaction) => t.transectionType === "credit")
              .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
              .toLocaleString()}
          </p>
        </div>
      </motion.div>

      <motion.div 
        className="transactions-list"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((txn: Transaction, index: number) => (
            <motion.div 
              key={txn._id} 
              className="transaction-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.5 }}
              whileHover={{ x: 5, scale: 1.01 }}
              onClick={() => handleTransactionClick(txn)}
              style={{ cursor: 'pointer' }}
            >
              <div className="transaction-icon">
                <div className={`icon-wrapper ${txn.transectionType}`}>
                  {txn.transectionType === 'debit' ? 
                    <ArrowDownRight size={20} /> : 
                    <ArrowUpRight size={20} />
                  }
                </div>
              </div>
              <div className="transaction-details">
                <h4>{txn.spentOn}</h4>
                <p className="transaction-meta">
                  <span className="category">{txn.category}</span>
                  <span className="date">{new Date(txn.onDate).toLocaleDateString()}</span>
                </p>
              </div>
              <div className={`transaction-amount ${txn.transectionType}`}>
                {txn.transectionType === 'debit' ? '-' : '+'}₹{txn.amount.toLocaleString()}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <TransactionDetailDialog
        isOpen={showTransactionDetail}
        onClose={() => setShowTransactionDetail(false)}
        transaction={selectedTransaction}
        userId={user._id}
        onUpdate={handleTransactionUpdate}
      />
    </motion.div>
  );
};

export default Transactions;