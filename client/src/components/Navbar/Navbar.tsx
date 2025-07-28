import React from "react";
import { motion } from "framer-motion";
import { Search, Bell, Plus } from "lucide-react";
import "./Navbar.scss";

interface NavbarProps {
  user: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, searchTerm, setSearchTerm }) => {
  if (!user) return null;

  return (
    <motion.header 
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="navbar-left">
        {/* <div className="navbar-logo">
          <img src="/logo.png" alt="Spendly" className="logo-image" />
        </div> */}
        <div className="navbar-content">
          <h1>Welcome back, {user.fullName.split(' ')[0]}!</h1>
          <p>Here's what's happening with your finances today.</p>
        </div>
      </div>
      <div className="navbar-right">
        <div className="search-container">
          <Search size={18} />
          <input 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <motion.button 
          className="notification-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bell size={18} />
          <span className="notification-badge">3</span>
        </motion.button>
        <motion.button 
          className="add-transaction-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={18} />
          Add Transaction
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Navbar;