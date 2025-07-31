import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  TrendingUp,
  Wallet,
  BarChart2,
  CreditCard,
  Check,
  Star,
  Crown,
} from "lucide-react";
import UserProfileDialog from "../UserProfileDialog/UserProfileDialog";
import "./Sidebar.scss";

interface SidebarProps {
  user: any;
  onUserUpdate?: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onUserUpdate, isMobileMenuOpen, onMobileMenuClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems = [
    { id: "dashboard", icon: TrendingUp, label: "Dashboard", path: "/dashboard" },
    { id: "transactions", icon: Wallet, label: "All Transactions", path: "/transactions" },
    { id: "monthly", icon: BarChart2, label: "Monthly Summary", path: "/monthly-summary" },
    ...(user?.tier !== "free" ? [{ id: "trends", icon: BarChart2, label: "Category Trends", path: "/category-trends" }] : []),
    ...(user?.tier === "premium" ? [{ id: "autopays", icon: CreditCard, label: "AutoPays & EMIs", path: "/autopays" }] : []),
    ...(user?.tier === "free" ? [{ id: "upgrade", icon: TrendingUp, label: "Upgrade", path: "/payment", special: true }] : []),
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
    { id: "logout", icon: LogOut, label: "Logout", path: "/logout", danger: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleSidebarClick = (item: any) => {
    if (item.id === "logout") {
      handleLogout();
    } else {
      navigate(item.path);
    }
    // Close mobile menu after navigation
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "free":
        return <Check size={14} />;
      case "plus":
        return <Star size={14} />;
      case "premium":
        return <Crown size={14} />;
      default:
        return <Check size={14} />;
    }
  };

  if (!user) return null;

  return (
    <motion.aside 
      className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      initial={{ x: isMobile ? -280 : -250 }}
      animate={{ 
        x: isMobile ? (isMobileMenuOpen ? 0 : -280) : 0 
      }}
      transition={{ duration: isMobile ? 0.3 : 0.5, ease: "easeOut" }}
    >
      <motion.div 
        className="sidebar-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="logo-container">
          <div className="logo-icon">
            <img src="/logo.png" alt="Spendly" className="logo-image" />
          </div>
        </div>
        <div className="user-badge">
          <span className={`tier-badge ${user.tier}`}>
            {getTierIcon(user.tier)}
            {user.tier}
          </span>
        </div>
      </motion.div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item, index) => (
          <motion.div
            key={item.id}
            className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.special ? 'special' : ''} ${item.danger ? 'danger' : ''}`}
            onClick={() => handleSidebarClick(item)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index + 0.3 }}
            whileHover={{ x: 5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="nav-item-content">
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
            {isActive(item.path) && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.div>
        ))}
      </nav>

      <motion.div 
        className="sidebar-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div 
          className="user-info"
          onClick={() => setShowProfileDialog(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ cursor: 'pointer' }}
        >
          <div className="user-avatar">
            <User size={16} />
          </div>
          <div className="user-details">
            <span className="user-name">{user.fullName}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </motion.div>
      </motion.div>

      <UserProfileDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        user={user}
        onUpdate={onUserUpdate || (() => window.location.reload())}
      />
    </motion.aside>
  );
};

export default Sidebar;