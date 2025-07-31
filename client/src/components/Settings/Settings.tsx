import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Bell,
  Clock,
  Shield,
  User,
  Save,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./Settings.scss";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useOutletContext<{
    user: any;
    refreshUser: () => void;
  }>();
  const [settings, setSettings] = useState({
    sessionTimeOut: "7d",
    notificationsOn: true,
    emailNotificationsOn: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setSettings({
        sessionTimeOut: user.sessionTimeOut || "7d",
        notificationsOn: user.notificationsOn ?? true,
        emailNotificationsOn: user.emailNotificationsOn ?? true,
      });
    }
  }, [user]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${backendURL}/user/edit/${user._id}`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Settings updated successfully!");
      refreshUser();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleManagePayment = () => {
    navigate("/payment");
  };

  const sessionTimeoutOptions = [
    { value: "never", label: "Never" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "60d", label: "60 Days" },
  ];

  if (!user) return null;

  return (
    <div className="settings-page">
      <motion.div
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <SettingsIcon size={24} />
          <div>
            <h1>Settings</h1>
            <p>Manage your account preferences and security settings</p>
          </div>
        </div>
      </motion.div>

      <div className="settings-content">
        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="section-header">
            <Clock size={20} />
            <h2>Session Management</h2>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Session Timeout</h3>
                <p>Choose how long you stay logged in</p>
              </div>
              <select
                value={settings.sessionTimeOut}
                onChange={(e) =>
                  handleSettingChange("sessionTimeOut", e.target.value)
                }
                className="setting-select"
              >
                {sessionTimeoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <Bell size={20} />
            <h2>Notifications</h2>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Push Notifications</h3>
                <p>Receive notifications in the app</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notificationsOn}
                  onChange={(e) =>
                    handleSettingChange("notificationsOn", e.target.checked)
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Email Notifications</h3>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsOn}
                  onChange={(e) =>
                    handleSettingChange(
                      "emailNotificationsOn",
                      e.target.checked
                    )
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <Shield size={20} />
            <h2>Security</h2>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Two-Factor Authentication</h3>
                <p>2FA is currently not available in this version</p>
              </div>
              <div className="setting-status disabled">
                <X size={16} />
                <span>Not Available</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header">
            <User size={20} />
            <h2>Account Information</h2>
          </div>
          <div className="section-content">
            <div className="account-info-grid">
              <div className="info-item">
                <span className="label">Full Name</span>
                <span className="value">{user.fullName}</span>
              </div>
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Plan</span>
                <span className={`value plan-${user.tier}`}>
                  {user.tier?.charAt(0).toUpperCase() + user.tier?.slice(1)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Member Since</span>
                <span className="value">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="account-actions">
              <button
                className="manage-payment-btn"
                onClick={handleManagePayment}
              >
                <CreditCard size={16} />
                Manage Payment
              </button>
            </div>
          </div>
        </motion.div>

        {(success || error) && (
          <motion.div
            className={`message ${success ? "success" : "error"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success ? <Check size={16} /> : <X size={16} />}
            <span>{success || error}</span>
          </motion.div>
        )}

        <motion.div
          className="settings-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            className="save-btn"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
