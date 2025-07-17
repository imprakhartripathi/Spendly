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
  free: [
    "User registration and login",
    "Add/edit/delete income and expenses",
    "View list of transactions",
    "View basic monthly summary (total income and expenses)",
  ],
  plus: [
    "All Free features",
    "Set and track budgets",
    "Category-wise analytics (charts)",
    "Download reports in .txt format",
    "View spending trends by category",
  ],
  premium: [
    "All Plus features",
    "Advanced reports in downloadable PDF format",
    "Recurring transactions setup",
    "Alerts and reminders for bills/budget limits",
    "Monthly financial goal tracking",
  ],
};


const MakePayment: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
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
      .catch(() => alert("Failed to fetch user info"))
      .finally(() => setUserLoading(false));
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
      window.location.reload();
    } else {
      setLoading(true);
      const subsRes = await axios.post(
        `${backendURL}/create-subscription`,
        { tier: selectedTier },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: subscription_id } = subsRes.data;

      const options = {
        key: import.meta.env.RAZORPAY_KEY_ID,
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
          window.location.reload();

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
    return user?.tier === selectedTier;
  };

  if (userLoading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading user information...</p>
      </div>
    );
  }

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
          <button className="back-button" onClick={() => navigate("/")}>
            Home
          </button>
        </div>
      </div>

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
            <p className="price">
              {tier === "free"
                ? "₹0 / month"
                : `₹${tier === "plus" ? 99 : 199} / month`}
            </p>

            <ul>
              {TIER_FEATURES[tier].map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
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
          <h3>Subscription Details</h3>
          <div className="subscription-grid">
            <div>
              <strong>Name:</strong> {user.fullName}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Contact:</strong> {user.contact || "N/A"}
            </div>
            <div>
              <strong>Current Plan:</strong> {capitalize(user.tier)}
            </div>
            <div>
              <strong>Subscription ID:</strong> {user.subscriptionId || "N/A"}
            </div>
            <div>
              <strong>Payment ID:</strong> {user.paymentId || "N/A"}
            </div>
            <div>
              <strong>Next Due Date:</strong> {getReadableDate(user.expiresAt)}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MakePayment;
