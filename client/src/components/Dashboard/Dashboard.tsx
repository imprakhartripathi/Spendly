import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./Dashboard.scss";

interface User {
  _id: string;
  fullName: string;
  email: string;
  tier: string;
  sessionTimeOut: string;
  income: number;
  notificationsOn: boolean;
  emailNotificationsOn: boolean;
  createdAt: string;
  updatedAt: string;
  transections: any[];
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${backendURL}/getuserinfo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error("Auth failed", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [navigate]);

  if (!user) {
    return (
      <div className="text-center mt-10 text-lg font-medium">Loading...</div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Welcome, {user.fullName}</h2>

      <div className="info-grid">
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Tier:</strong> {user.tier}
        </div>
        <div>
          <strong>Session Timeout:</strong> {user.sessionTimeOut}
        </div>
        <div>
          <strong>Income:</strong> ₹{user.income}
        </div>
        <div>
          <strong>Notifications:</strong> {user.notificationsOn ? "On" : "Off"}
        </div>
        <div>
          <strong>Email Notifications:</strong>{" "}
          {user.emailNotificationsOn ? "On" : "Off"}
        </div>
        <div>
          <strong>Created At:</strong>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </div>
        <div>
          <strong>Last Updated:</strong>{" "}
          {new Date(user.updatedAt).toLocaleString()}
        </div>
      </div>

      <div className="transactions">
        <h3>Transactions</h3>
        {user.transections.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {user.transections.map((tx, index) => (
              <li key={index}>
                {tx.category} - ₹{tx.amount}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
