import React, { useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./AutoPays.scss";

const AutoPays: React.FC = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div 
      className="autopays-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="page-header">
        <h1>AutoPays & EMIs</h1>
        <p>Manage your automatic payments and EMI schedules</p>
      </div>
      
      <div className="coming-soon">
        <h2>Coming Soon</h2>
        <p>This premium feature is currently under development and will be available soon.</p>
      </div>
    </motion.div>
  );
};

export default AutoPays;