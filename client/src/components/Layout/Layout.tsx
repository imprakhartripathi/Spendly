import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../app.config";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.scss";

const Layout: React.FC = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendURL}/getuserinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="layout-loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <main className="layout-main">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default Layout;