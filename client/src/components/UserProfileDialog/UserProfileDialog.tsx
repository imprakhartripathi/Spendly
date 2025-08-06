import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, Save, Camera, Crown, Star, Check } from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import Portal from "../Portal/Portal";
import "./UserProfileDialog.scss";

interface UserProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reset form data when dialog opens/closes or when user changes
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        contact: user.contact || "",
        image: user.image || ""
      });
      // Reset error and success states when opening
      setError("");
      setSuccess("");
    }
  }, [isOpen, user]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  const handleClose = () => {
    // Reset form state when closing
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        contact: user.contact || "",
        image: user.image || ""
      });
    }
    setError("");
    setSuccess("");
    setLoading(false);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${backendURL}/user/edit/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Profile updated successfully!");
      onUpdate();
      setTimeout(() => {
        setSuccess("");
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
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

  const formatDate = (timestamp: number | null) => {
    return timestamp ? new Date(timestamp).toLocaleDateString() : "N/A";
  };

  if (!isOpen || !user) return null;

  return (
    <Portal>
      <motion.div 
        className="profile-overlay modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
      <motion.div 
        className={`profile-dialog ${isOpen ? 'open' : ''}`}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'tween', duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {user.image ? (
                <img src={user.image} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={32} />
                </div>
              )}
              <button className="avatar-edit-btn">
                <Camera size={16} />
              </button>
            </div>
            <div className="user-info">
              <h3>{user.fullName}</h3>
              <div className="tier-badge-container">
                <div 
                  className={`tier-badge ${user.tier}`}
                  style={{ color: getTierColor(user.tier) }}
                >
                  {getTierIcon(user.tier)}
                  <span>{user.tier?.charAt(0).toUpperCase() + user.tier?.slice(1)} Plan</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h4>Personal Information</h4>
              
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
                  required
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
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Account Details</h4>
              
              <div className="account-details">
                <div className="detail-item">
                  <span className="label">Member Since:</span>
                  <span className="value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="label">Subscription ID:</span>
                  <span className="value">{user.subscriptionId || "N/A"}</span>
                </div>
                
                <div className="detail-item">
                  <span className="label">Next Billing:</span>
                  <span className="value">{formatDate(user.expiresAt)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="label">Total Transactions:</span>
                  <span className="value">{user.transections?.length || 0}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={handleClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="save-btn">
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
      </motion.div>
    </Portal>
  );
};

export default UserProfileDialog;