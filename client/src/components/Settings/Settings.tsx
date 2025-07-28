import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../app.config";
import { User, Mail, Phone, MapPin, CreditCard, Bell, Shield, Save, Crown, Star, Check } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import "./Settings.scss";

const Settings: React.FC = () => {
  const { user } = useOutletContext<{ user: any }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    monthlyBudget: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    budgetAlerts: true,
    transactionAlerts: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        monthlyBudget: user.monthlyBudget || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendURL}/updateuser`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Show success message
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error("Error updating user:", error);
      setSaving(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "free":
        return <Check size={16} />;
      case "plus":
        return <Star size={16} />;
      case "premium":
        return <Crown size={16} />;
      default:
        return <Check size={16} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "#6b7280";
      case "plus":
        return "#10b981";
      case "premium":
        return "#38b6ff";
      default:
        return "#6b7280";
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  if (!user) {
    return (
      <div className="settings-loading">
        <div className="loader"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="settings-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <motion.div 
          className="settings-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              whileHover={{ x: 5 }}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="settings-main"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {activeTab === "profile" && (
            <div className="settings-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  <User size={32} />
                </div>
                <div className="profile-info">
                  <h2>{user?.fullName || "User"}</h2>
                  <div className="profile-tier">
                    {getTierIcon(user?.tier)}
                    <span style={{ color: getTierColor(user?.tier) }}>
                      {user?.tier?.charAt(0).toUpperCase() + user?.tier?.slice(1)} Plan
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="profile-form">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <User size={16} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Phone size={16} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <MapPin size={16} />
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>
                      <CreditCard size={16} />
                      Monthly Budget
                    </label>
                    <input
                      type="number"
                      name="monthlyBudget"
                      value={formData.monthlyBudget}
                      onChange={handleInputChange}
                      placeholder="Enter your monthly budget"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="notification-options">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="notification-item">
                    <div className="notification-info">
                      <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                      <p>Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1')}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleNotificationChange(key)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <div className="security-options">
                <div className="security-item">
                  <h3>Change Password</h3>
                  <p>Update your password to keep your account secure</p>
                  <button className="secondary-btn">Change Password</button>
                </div>
                <div className="security-item">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                  <button className="secondary-btn">Enable 2FA</button>
                </div>
                <div className="security-item">
                  <h3>Login Sessions</h3>
                  <p>Manage your active login sessions</p>
                  <button className="secondary-btn">View Sessions</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="settings-section">
              <h2>Billing & Subscription</h2>
              <div className="billing-info">
                <div className="current-plan-card">
                  <div className="plan-header">
                    <div className="plan-icon">
                      {getTierIcon(user?.tier)}
                    </div>
                    <div className="plan-details">
                      <h3>Current Plan</h3>
                      <div className="plan-badge-container">
                        <span className={`plan-badge ${user?.tier}`}>
                          {user?.tier?.charAt(0).toUpperCase() + user?.tier?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="plan-description">
                    <p>
                      {user?.tier === "free" && "Basic features for personal expense tracking"}
                      {user?.tier === "plus" && "Enhanced features with budgets and analytics"}
                      {user?.tier === "premium" && "Full access to all premium features"}
                    </p>
                  </div>
                  <div className="plan-actions">
                    <button 
                      className="primary-btn"
                      onClick={() => navigate("/payment")}
                    >
                      {user?.tier === "free" ? "Upgrade Plan" : "Manage Subscription"}
                    </button>
                  </div>
                </div>
                
                {user?.subscriptionId && (
                  <div className="subscription-details">
                    <h3>Subscription Details</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="label">Subscription ID:</span>
                        <span className="value">{user.subscriptionId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Status:</span>
                        <span className="value status active">Active</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Next Billing:</span>
                        <span className="value">
                          {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <motion.div 
            className="settings-actions"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;