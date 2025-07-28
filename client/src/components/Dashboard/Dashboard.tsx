import { useState } from "react";
import { useOutletContext } from "react-router-dom";
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
// import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import "./Dashboard.scss";

interface Transaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  category: string;
  spentOn: string;
  onDate: string;
}

const COLORS = ["#38b6ff", "#007bb5", "#ffc658", "#ff7f50"];

const Dashboard = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [searchTerm, setSearchTerm] = useState("");
  const transactions: Transaction[] = user?.transections || [];

  if (!user) return <div className="loading">Loading...</div>;

  const totalDebit = transactions
    .filter((t: Transaction) => t.transectionType === "debit")
    .reduce((a: number, b: Transaction) => a + b.amount, 0);

  const totalCredit = transactions
    .filter((t: Transaction) => t.transectionType === "credit")
    .reduce((a: number, b: Transaction) => a + b.amount, 0);

  const currentBalance = user.income + totalCredit - totalDebit;

  const categoryStats = transactions.reduce((acc: Record<string, number>, txn: Transaction) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {} as Record<string, number>);
  const categoryChartData = Object.keys(categoryStats).map((key) => ({
    name: key,
    value: categoryStats[key],
  }));

  const monthlyData = transactions.reduce((acc: Record<string, number>, txn: Transaction) => {
    const month = new Date(txn.onDate).toLocaleString("default", {
      month: "short",
    });
    if (!acc[month]) acc[month] = user.income;
    acc[month] += txn.transectionType === "credit" ? txn.amount : -txn.amount;
    return acc;
  }, {} as Record<string, number>);
  const monthlyChartData = Object.keys(monthlyData).map((month) => ({
    month,
    balance: monthlyData[month],
  }));

  return (
    <div className="dashboard-container">

      <motion.main 
        className="main-content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Navbar user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <section className="summary-cards">
                <motion.div 
                  className="summary-card debit"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="card-icon">
                    <ArrowDownRight size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Total Spent</h3>
                    <p className="amount">₹{totalDebit.toLocaleString()}</p>
                    <span className="change negative">-2.5% from last month</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="summary-card credit"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="card-icon">
                    <ArrowUpRight size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Total Income</h3>
                    <p className="amount">₹{totalCredit.toLocaleString()}</p>
                    <span className="change positive">+5.2% from last month</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="summary-card balance"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="card-icon">
                    <Wallet size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Current Balance</h3>
                    <p className="amount">₹{currentBalance.toLocaleString()}</p>
                    <span className="change positive">+12.8% from last month</span>
                  </div>
                </motion.div>

                {user.tier !== "free" && (
                  <motion.div 
                    className="summary-card budget"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
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
                          : 0}%
                      </p>
                      <span className="budget-details">
                        ₹{totalDebit.toLocaleString()} / ₹{user.monthlyBudget?.toLocaleString() || 0}
                      </span>
                      <div className="progress-bar">
                        <motion.div 
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${user.monthlyBudget ? Math.min((totalDebit / user.monthlyBudget) * 100, 100) : 0}%` 
                          }}
                          transition={{ delay: 0.8, duration: 1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
          </section>
        </motion.div>

        <section className="charts-section">
          {user.tier !== "free" && (
            <motion.div
              className="chart-card category-chart"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="chart-header">
                <h3>Spending by Category</h3>
                <motion.button 
                  className="chart-filter-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
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
                    paddingAngle={2}
                  >
                    {categoryChartData.map((_, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <motion.div
            className="chart-card balance-chart"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: user.tier !== "free" ? 0.4 : 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="chart-header">
              <h3>Balance Trend</h3>
              <div className="chart-period">
                <span className="period-btn active">This Month</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#38b6ff"
                  strokeWidth={3}
                  dot={{ fill: '#38b6ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#38b6ff', strokeWidth: 2 }}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Balance']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </section>

        <motion.section 
          className="recent-transactions"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <motion.button 
              className="view-all-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
          </div>
          <div className="transactions-list">
            {transactions.slice(0, 5).map((txn: Transaction, index: number) => (
              <motion.div 
                key={txn._id} 
                className="transaction-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.7 }}
                whileHover={{ x: 5, scale: 1.01 }}
              >
                <div className="transaction-icon">
                  <div className={`icon-wrapper ${txn.transectionType}`}>
                    {txn.transectionType === 'debit' ? 
                      <ArrowDownRight size={16} /> : 
                      <ArrowUpRight size={16} />
                    }
                  </div>
                </div>
                <div className="transaction-details">
                  <h4>{txn.spentOn}</h4>
                  <p>{txn.category} • {new Date(txn.onDate).toLocaleDateString()}</p>
                </div>
                <div className={`transaction-amount ${txn.transectionType}`}>
                  {txn.transectionType === 'debit' ? '-' : '+'}₹{txn.amount.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
};

export default Dashboard;
