import React, { useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import "./MonthlySummary.scss";

interface Transaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  category: string;
  spentOn: string;
  onDate: string;
}

interface MonthlyStats {
  [key: string]: {
    month: string;
    income: number;
    expenses: number;
    net: number;
  };
}

interface CategoryBreakdown {
  [key: string]: number;
}

const MonthlySummary: React.FC = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const transactions: Transaction[] = user?.transections || [];
  const loading = !user;

  const getMonthlyData = () => {
    const monthlyStats: MonthlyStats = {};
    const currentDate = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyStats[monthKey] = {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income: 0,
        expenses: 0,
        net: 0,
      };
    }

    // Process transactions
    transactions.forEach((txn: Transaction) => {
      const txnDate = new Date(txn.onDate);
      const monthKey = `${txnDate.getFullYear()}-${txnDate.getMonth()}`;
      
      if (monthlyStats[monthKey]) {
        if (txn.transectionType === 'credit') {
          monthlyStats[monthKey].income += txn.amount;
        } else {
          monthlyStats[monthKey].expenses += txn.amount;
        }
        monthlyStats[monthKey].net = monthlyStats[monthKey].income - monthlyStats[monthKey].expenses;
      }
    });

    return Object.values(monthlyStats);
  };

  const getCurrentMonthData = () => {
    const currentMonthTransactions = transactions.filter((txn: Transaction) => {
      const txnDate = new Date(txn.onDate);
      return txnDate.getMonth() === selectedMonth && txnDate.getFullYear() === selectedYear;
    });

    const income = currentMonthTransactions
      .filter((t: Transaction) => t.transectionType === 'credit')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    const expenses = currentMonthTransactions
      .filter((t: Transaction) => t.transectionType === 'debit')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const categoryBreakdown: CategoryBreakdown = {};
    currentMonthTransactions
      .filter((t: Transaction) => t.transectionType === 'debit')
      .forEach((txn: Transaction) => {
        categoryBreakdown[txn.category] = (categoryBreakdown[txn.category] || 0) + txn.amount;
      });

    return {
      income,
      expenses,
      net: income - expenses,
      transactions: currentMonthTransactions,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
    };
  };

  const monthlyData = getMonthlyData();
  const currentMonthData = getCurrentMonthData();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="monthly-loading">
        <div className="loader"></div>
        <p>Loading monthly summary...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="monthly-summary-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="monthly-header">
        <div className="header-left">
          <h1>Monthly Summary</h1>
          <p>Track your financial performance month by month</p>
        </div>
        <div className="month-selector">
          <Calendar size={16} />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2024, 2023, 2022].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <motion.div 
        className="monthly-stats"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-number">₹{currentMonthData.income.toLocaleString()}</p>
            <span className="stat-change positive">+12.5% from last month</span>
          </div>
        </div>
        
        <div className="stat-card expenses">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-number">₹{currentMonthData.expenses.toLocaleString()}</p>
            <span className="stat-change negative">+5.2% from last month</span>
          </div>
        </div>
        
        <div className="stat-card net">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Net Savings</h3>
            <p className="stat-number">₹{currentMonthData.net.toLocaleString()}</p>
            <span className={`stat-change ${currentMonthData.net >= 0 ? 'positive' : 'negative'}`}>
              {currentMonthData.net >= 0 ? '+' : ''}₹{Math.abs(currentMonthData.net).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="charts-section">
        <motion.div 
          className="chart-card yearly-trend"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>12-Month Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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
              <Tooltip 
                formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} />
              <Line type="monotone" dataKey="net" stroke="#38b6ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          className="chart-card category-breakdown"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Category Breakdown - {months[selectedMonth]} {selectedYear}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentMonthData.categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
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
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#38b6ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MonthlySummary;