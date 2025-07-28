import React, { useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./CategoryTrends.scss";

const CategoryTrends: React.FC = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div 
      className="category-trends-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="page-header">
        <h1>Category Trends</h1>
        <p>Analyze your spending patterns across different categories</p>
      </div>
      
      <div className="coming-soon">
        <h2>Coming Soon</h2>
        <p>This feature is currently under development and will be available soon.</p>
      </div>
    </motion.div>
  );
};

export default CategoryTrends;