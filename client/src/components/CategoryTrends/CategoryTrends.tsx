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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react";
import Navbar from "../Navbar/Navbar";
import "./CategoryTrends.scss";

interface Transaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  category: string;
  spentOn: string;
  onDate: string;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageAmount: number;
}

// interface MonthlyTrend {
//   month: string;
//   [key: string]: string | number;
// }

const COLORS = ["#38b6ff", "#007bb5", "#ffc658", "#ff7f50", "#8884d8", "#82ca9d", "#ffc0cb", "#ffb347"];

const CategoryTrends: React.FC = () => {
  const { user, refreshUser } = useOutletContext<{ user: any; refreshUser: () => void }>();
  const [selectedPeriod, setSelectedPeriod] = useState<"3m" | "6m" | "1y">("6m");
  const [viewType, setViewType] = useState<"amount" | "count">("amount");

  const transactions: Transaction[] = user?.transections || [];

  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    const monthsBack = selectedPeriod === "3m" ? 3 : selectedPeriod === "6m" ? 6 : 12;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    
    return transactions.filter((txn) => {
      const txnDate = new Date(txn.onDate);
      return txnDate >= cutoffDate && txn.transectionType === "debit";
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate category statistics
  const getCategoryStats = (): CategoryData[] => {
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    filteredTransactions.forEach((txn) => {
      const existing = categoryMap.get(txn.category) || { total: 0, count: 0 };
      categoryMap.set(txn.category, {
        total: existing.total + txn.amount,
        count: existing.count + 1,
      });
    });

    const totalSpent = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.total,
        percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
        transactionCount: data.count,
        averageAmount: data.total / data.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categoryStats = getCategoryStats();

  // Get monthly trends for top categories
  // const getMonthlyTrends = (): MonthlyTrend[] => {
  //   const topCategories = categoryStats.slice(0, 5).map(cat => cat.category);
  //   const monthlyData = new Map<string, { [key: string]: number }>();

  //   filteredTransactions.forEach((txn) => {
  //     if (topCategories.includes(txn.category)) {
  //       const monthKey = new Date(txn.onDate).toLocaleString('default', { 
  //         month: 'short', 
  //         year: '2-digit' 
  //       });
        
  //       if (!monthlyData.has(monthKey)) {
  //         monthlyData.set(monthKey, {});
  //       }
        
  //       const monthData = monthlyData.get(monthKey)!;
  //       monthData[txn.category] = (monthData[txn.category] || 0) + txn.amount;
  //     }
  //   });

  //   return Array.from(monthlyData.entries())
  //     .map(([month, data]) => ({ month, ...data }))
  //     .sort((a, b) => {
  //       const dateA = new Date(a.month + ' 01');
  //       const dateB = new Date(b.month + ' 01');
  //       return dateA.getTime() - dateB.getTime();
  //     });
  // };

  // const monthlyTrends = getMonthlyTrends();

  // Generate insights
  const getInsights = () => {
    if (categoryStats.length === 0) {
      return {
        highest: null,
        lowest: null,
        mostFrequent: null,
        recommendation: "Start tracking your expenses to get personalized insights!",
      };
    }

    const highest = categoryStats[0];
    const lowest = categoryStats[categoryStats.length - 1];
    const mostFrequent = categoryStats.reduce((prev, current) => 
      prev.transactionCount > current.transactionCount ? prev : current
    );

    let recommendation = "";
    if (highest.percentage > 40) {
      recommendation = `Consider reducing spending on ${highest.category} as it represents ${highest.percentage.toFixed(1)}% of your total expenses.`;
    } else if (categoryStats.length > 5) {
      recommendation = "Your spending is well-distributed across categories. Consider setting category-wise budgets for better control.";
    } else {
      recommendation = "Track more categories to get better insights into your spending patterns.";
    }

    return { highest, lowest, mostFrequent, recommendation };
  };

  const insights = getInsights();

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <motion.div 
      className="category-trends-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar user={user} onRefresh={refreshUser} />
      
      <div className="page-header">
        <div className="header-content">
          <h1>Category Trends</h1>
          <p>Analyze your spending patterns across different categories</p>
        </div>
        
        <div className="header-controls">
          <div className="period-selector">
            <Calendar size={16} />
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as "3m" | "6m" | "1y")}
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 12 Months</option>
            </select>
          </div>
          
          <div className="view-selector">
            <Filter size={16} />
            <select 
              value={viewType} 
              onChange={(e) => setViewType(e.target.value as "amount" | "count")}
            >
              <option value="amount">By Amount</option>
              <option value="count">By Frequency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Insights Cards */}
      <motion.div 
        className="insights-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="insights-grid">
          {insights.highest && (
            <div className="insight-card highest">
              <div className="insight-icon">
                <TrendingUp size={24} />
              </div>
              <div className="insight-content">
                <h3>Highest Spending</h3>
                <p className="insight-value">{insights.highest.category}</p>
                <span className="insight-detail">
                  ₹{insights.highest.amount.toLocaleString()} ({insights.highest.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          {insights.lowest && (
            <div className="insight-card lowest">
              <div className="insight-icon">
                <TrendingDown size={24} />
              </div>
              <div className="insight-content">
                <h3>Lowest Spending</h3>
                <p className="insight-value">{insights.lowest.category}</p>
                <span className="insight-detail">
                  ₹{insights.lowest.amount.toLocaleString()} ({insights.lowest.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          {insights.mostFrequent && (
            <div className="insight-card frequent">
              <div className="insight-icon">
                <Target size={24} />
              </div>
              <div className="insight-content">
                <h3>Most Frequent</h3>
                <p className="insight-value">{insights.mostFrequent.category}</p>
                <span className="insight-detail">
                  {insights.mostFrequent.transactionCount} transactions
                </span>
              </div>
            </div>
          )}

          <div className="insight-card recommendation">
            <div className="insight-icon">
              <AlertCircle size={24} />
            </div>
            <div className="insight-content">
              <h3>Recommendation</h3>
              <p className="insight-text">{insights.recommendation}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Category Distribution */}
        <motion.div 
          className="chart-card category-distribution"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Category Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="60%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey={viewType === "amount" ? "amount" : "transactionCount"}
                  nameKey="category"
                  outerRadius={100}
                  innerRadius={50}
                >
                  {categoryStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    viewType === "amount" 
                      ? `₹${value.toLocaleString()}` 
                      : `${value} transactions`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="category-legend">
              {categoryStats.map((cat, index) => (
                <div key={cat.category} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="legend-content">
                    <span className="legend-name">{cat.category}</span>
                    <span className="legend-value">
                      {viewType === "amount" 
                        ? `₹${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`
                        : `${cat.transactionCount} transactions`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Category Comparison Bar Chart */}
        <motion.div 
          className="chart-card category-comparison"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Category Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => 
                  viewType === "amount" 
                    ? `₹${(value / 1000).toFixed(0)}k`
                    : value.toString()
                }
              />
              <Tooltip 
                formatter={(value) => [
                  viewType === "amount" 
                    ? `₹${value.toLocaleString()}`
                    : `${value} transactions`,
                  viewType === "amount" ? "Amount" : "Count"
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey={viewType === "amount" ? "amount" : "transactionCount"}
                fill="#38b6ff" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Trends */}
        {/* {monthlyTrends.length > 0 && (
          <motion.div 
            className="chart-card monthly-trends"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3>Monthly Trends (Top 5 Categories)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
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
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {categoryStats.slice(0, 5).map((cat, index) => (
                  <Line
                    key={cat.category}
                    type="monotone"
                    dataKey={cat.category}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )} */}
      </div>
    </motion.div>
  );
};

export default CategoryTrends;