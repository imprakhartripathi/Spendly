import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import NotificationsDialog from "../NotificationsDialog/NotificationsDialog";
import "./MobileNotificationButton.scss";

interface MobileNotificationButtonProps {
  user: any;
}

const MobileNotificationButton: React.FC<MobileNotificationButtonProps> = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendURL}/user/${user._id}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  if (!user) return null;

  return (
    <>
      <motion.button 
        className="mobile-notification-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(true)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="mobile-notification-badge">{unreadCount}</span>
        )}
      </motion.button>

      <NotificationsDialog
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userId={user._id}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
};

export default MobileNotificationButton;