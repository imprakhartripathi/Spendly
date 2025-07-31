import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, Trash2, AlertCircle, Info, DollarSign, Settings } from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import Portal from "../Portal/Portal";
import "./NotificationsDialog.scss";

interface Notification {
  _id: string;
  title: string;
  desc: string;
  type: "system" | "auth" | "promo" | "budget";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

const NotificationsDialog: React.FC<NotificationsDialogProps> = ({
  isOpen,
  onClose,
  userId,
  unreadCount,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendURL}/user/${userId}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications);
      onUnreadCountChange(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${backendURL}/user/${userId}/notifications/read`, {
        notificationIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (notificationIds) {
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        );
        const newUnreadCount = notifications.filter(n => 
          !n.isRead && !notificationIds.includes(n._id)
        ).length;
        onUnreadCountChange(newUnreadCount);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        onUnreadCountChange(0);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const clearOldNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendURL}/user/${userId}/notifications/clear?olderThanDays=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "budget":
        return <DollarSign size={16} />;
      case "system":
        return <Settings size={16} />;
      case "auth":
        return <AlertCircle size={16} />;
      case "promo":
        return <Info size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "budget":
        return "#ef4444";
      case "system":
        return "#38b6ff";
      case "auth":
        return "#f59e0b";
      case "promo":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <motion.div 
        className="notifications-overlay modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
      <motion.div 
        className="notifications-dialog"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="dialog-header">
          <div className="header-left">
            <Bell size={20} />
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={() => markAsRead()}
              >
                <Check size={16} />
                Mark all read
              </button>
            )}
            <button 
              className="clear-old-btn"
              onClick={clearOldNotifications}
            >
              <Trash2 size={16} />
              Clear old
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="notifications-content">
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <h3>No notifications</h3>
              <p>You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            <div className="notifications-list">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => !notification.isRead && markAsRead([notification._id])}
                  >
                    <div 
                      className="notification-icon"
                      style={{ color: getNotificationColor(notification.type) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4>{notification.title}</h4>
                        <span className="notification-time">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p>{notification.desc}</p>
                      <div className="notification-meta">
                        <span className={`notification-type ${notification.type}`}>
                          {notification.type}
                        </span>
                        {!notification.isRead && (
                          <span className="unread-indicator">•</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
      </motion.div>
    </Portal>
  );
};

export default NotificationsDialog;