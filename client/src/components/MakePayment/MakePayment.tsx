import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./MakePayment.scss";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";

const TIERS = ["free", "plus", "premium"] as const;
type Tier = (typeof TIERS)[number];

const TIER_FEATURES: Record<Tier, string[]> = {
  free: ["Basic Budgeting", "Manual Transactions"],
  plus: ["All Free Features", "Auto Transaction Reminders", "Email Alerts"],
  premium: ["All Plus Features", "Advanced Analytics", "Priority Support"],
};

const MakePayment: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please login again.");
      return;
    }

    axios
      .get(`${backendURL}/getuserinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userData = res.data.user;
        setUser(userData);
        setCurrentTier(userData.tier);
        setSelectedTier(userData.tier);
        setUserId(userData._id);
      })
      .catch(() => alert("Failed to fetch user info"));
  }, []);

  const handleContinue = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedTier || !userId) return;

    if (selectedTier === "free") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel your subscription?"
      );
      if (!confirmed) return;
      const doubleCheck = window.confirm(
        "This will downgrade you to the Free plan. Proceed?"
      );
      if (!doubleCheck) return;

      setLoading(true);
      await axios.post(
        `${backendURL}/cancel-subs/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Subscription Cancelled. Downgraded to Free.");
      setCurrentTier("free");
      setLoading(false);
    } else {
      setLoading(true);
      const subsRes = await axios.post(
        `${backendURL}/create-subscription`,
        { tier: selectedTier },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: subscription_id } = subsRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        name: "Spendly",
        description: `Upgrade to ${selectedTier}`,
        subscription_id,
        handler: async function (response: any) {
          await axios.post(
            `${backendURL}/verify-payment/${userId}`,
            {
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier: selectedTier,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert(`Successfully upgraded to ${selectedTier}`);
          setCurrentTier(selectedTier);
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.contact || "",
        },
        notes: `Generated Subscription By Spendly User ${user?.fullName}, ID: ${user?._id}`,
        theme: {
          color: "#38b6ff",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setLoading(false);
    }
  };

  const getReadableDate = (timestamp: number | null) => {
    return timestamp ? new Date(timestamp).toLocaleDateString() : "N/A";
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const getButtonLabel = () => {
    if (loading) return "Processing...";

    if (!selectedTier) return "Select a Plan";

    if (user?.tier === "free") {
      if (selectedTier === "free") return "Upgrade";
      return "Upgrade";
    }

    if (user?.tier === "plus") {
      if (selectedTier === "plus") return "Upgrade";
      if (selectedTier === "free") return "Unsubscribe";
      if (selectedTier === "premium") return "Upgrade";
    }

    if (user?.tier === "premium") {
      if (selectedTier === "premium") return "Upgrade";
      if (selectedTier === "plus") return "Downgrade";
      if (selectedTier === "free") return "Unsubscribe";
    }

    return "Continue";
  };

  const isButtonDisabled = () => {
    if (loading || !selectedTier || !userId) return true;

    if (user?.tier === "free") return selectedTier === "free";

    if (user?.tier === "plus") return selectedTier === "plus";

    if (user?.tier === "premium") return selectedTier === "premium";

    return false;
  };



  return (
    <motion.div
      className="payment-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="img">
        <img src={logo} alt="Logo" className="logo" />

        <div className="btn">
          <button onClick={handleContinue} disabled={isButtonDisabled()}>
            {getButtonLabel()}
          </button>

          <button className="back-button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <h1>Choose Your Plan</h1>

      <div className="tier-options">
        {TIERS.map((tier) => (
          <motion.div
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`tier-card ${selectedTier === tier ? "selected" : ""}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <h2>{capitalize(tier)}</h2>
            <ul>
              {TIER_FEATURES[tier].map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            {tier !== "free" && (
              <p className="price">₹{tier === "plus" ? 99 : 199} / month</p>
            )}
            {currentTier === tier && (
              <span className="current-label">Current Plan</span>
            )}
          </motion.div>
        ))}
      </div>

      {user && (
        <motion.div
          className="current-subscription"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Current Subscription</h3>
          <p>
            Plan: <strong>{user.tier}</strong>
          </p>
          <p>Subscription ID: {user.subscriptionId || "N/A"}</p>
          <p>Payment ID: {user.paymentId || "N/A"}</p>
          <p>Valid Till: {getReadableDate(user.expiresAt)}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MakePayment;
