import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart2,
  Filter,
} from "lucide-react";
import Navbar from "../Navbar/Navbar";
import TransactionDetailDialog from "../TransactionDetailDialog/TransactionDetailDialog";
import "./Dashboard.scss";

interface Transaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  category: string;
  spentOn: string;
  spentOnDesc: string;
  onDate: string;
}

const COLORS = ["#38b6ff", "#007bb5", "#ffc658", "#ff7f50"];

const Dashboard = () => {
  const { user, refreshUser } = useOutletContext<{
    user: any;
    refreshUser: () => void;
  }>();
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const navigate = useNavigate();

  const transactions: Transaction[] = user?.transections || [];

  if (!user) return <div className="loading">Loading...</div>;

  const totalDebit = transactions
    .filter((t) => t.transectionType === "debit")
    .reduce((a, b) => a + b.amount, 0);

  const totalCredit = transactions
    .filter((t) => t.transectionType === "credit")
    .reduce((a, b) => a + b.amount, 0);

  const currentBalance = user.income + totalCredit - totalDebit;

  const categoryStats = transactions.reduce(
    (acc: Record<string, number>, txn) => {
      acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      return acc;
    },
    {}
  );
  const categoryChartData = Object.keys(categoryStats).map((key) => ({
    name: key,
    value: categoryStats[key],
  }));

  const monthlyData = transactions.reduce(
    (acc: Record<string, number>, txn) => {
      const month = new Date(txn.onDate).toLocaleString("default", {
        month: "short",
      });
      if (!acc[month]) acc[month] = user.income;
      acc[month] += txn.transectionType === "credit" ? txn.amount : -txn.amount;
      return acc;
    },
    {}
  );
  const monthlyChartData = Object.keys(monthlyData).map((month) => ({
    month,
    balance: monthlyData[month],
  }));

  // Sort transactions by date (latest first)
  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.onDate).getTime() - new Date(a.onDate).getTime())
    .slice(0, 5);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const handleTransactionUpdate = () => {
    refreshUser();
  };

  return (
    <div className="dashboard-container">
      <motion.main
        className="main-content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Navbar user={user} onRefresh={refreshUser} />

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <section className="summary-cards">
            <motion.div
              className="summary-card debit"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="card-icon">
                <ArrowDownRight size={24} />
              </div>
              <div className="card-content">
                <h3>Total Spent</h3>
                <p className="amount">₹{totalDebit.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div
              className="summary-card credit"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="card-icon">
                <ArrowUpRight size={24} />
              </div>
              <div className="card-content">
                <h3>Total Income</h3>
                <p className="amount">₹{totalCredit.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div
              className="summary-card balance"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="card-icon">
                <Wallet size={24} />
              </div>
              <div className="card-content">
                <h3>Current Balance</h3>
                <p className="amount">₹{currentBalance.toLocaleString()}</p>
              </div>
            </motion.div>

            {user.tier !== "free" && (
              <motion.div
                className="summary-card budget"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="card-icon">
                  <BarChart2 size={24} />
                </div>
                <div className="card-content">
                  <h3>Budget Usage</h3>
                  <p className="amount">
                    {user.monthlyBudget
                      ? ((totalDebit / user.monthlyBudget) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                  <span className="budget-details">
                    ₹{totalDebit.toLocaleString()} / ₹
                    {user.monthlyBudget?.toLocaleString() || 0}
                  </span>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      animate={{
                        width: `${
                          user.monthlyBudget
                            ? Math.min(
                                (totalDebit / user.monthlyBudget) * 100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        </motion.div>

        {/* Charts */}
        <section className="charts-section">
          {user.tier !== "free" && (
            <motion.div
              className="chart-card category-chart"
              whileHover={{ y: -5 }}
            >
              <div className="chart-header">
                <h3>Spending by Category</h3>
                <motion.button className="chart-filter-btn">
                  <Filter size={16} />
                </motion.button>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={40}
                  >
                    {categoryChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <motion.div
            className="chart-card balance-chart"
            whileHover={{ y: -5 }}
          >
            <div className="chart-header">
              <h3>Balance Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#38b6ff"
                  strokeWidth={3}
                />
                <Tooltip
                  formatter={(v) => [`₹${v.toLocaleString()}`, "Balance"]}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </section>

        {/* Recent Transactions */}
        <motion.section
          className="recent-transactions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <motion.button
              className="view-all-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/transactions")}
            >
              View All
            </motion.button>
          </div>
          <div className="transactions-list">
            {latestTransactions.map((txn, index) => (
              <motion.div
                key={txn._id}
                className="transaction-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.7 }}
                whileHover={{ x: 5, scale: 1.01 }}
                onClick={() => handleTransactionClick(txn)}
                style={{ cursor: "pointer" }}
              >
                <div className="transaction-icon">
                  <div className={`icon-wrapper ${txn.transectionType}`}>
                    {txn.transectionType === "debit" ? (
                      <ArrowDownRight size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>
                </div>
                <div className="transaction-details">
                  <h4>{txn.spentOn}</h4>
                  <p>
                    {txn.category} • {new Date(txn.onDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`transaction-amount ${txn.transectionType}`}>
                  {txn.transectionType === "debit" ? "-" : "+"}₹
                  {txn.amount.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.main>

      <TransactionDetailDialog
        isOpen={showTransactionDetail}
        onClose={() => setShowTransactionDetail(false)}
        transaction={selectedTransaction}
        userId={user._id}
        onUpdate={handleTransactionUpdate}
      />
    </div>
  );
};

export default Dashboard;
