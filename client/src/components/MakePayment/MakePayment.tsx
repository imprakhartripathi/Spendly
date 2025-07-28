import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./MakePayment.scss";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CreditCard, Check, Star } from "lucide-react";

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
  const { user } = useOutletContext<{ user: any }>();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setCurrentTier(user.tier);
      setSelectedTier(user.tier);
    }
  }, [user]);

  const handleContinue = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedTier || !user?._id) return;

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
        `${backendURL}/cancel-subs/${user._id}`,
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
            `${backendURL}/verify-payment/${user._id}`,
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
    if (loading || !selectedTier || !user?._id) return true;
    return user?.tier === selectedTier;
  };

  if (!user) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <motion.main 
        className="main-content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="page-header">
            <div className="header-content">
              <h1>
                <CreditCard className="header-icon" />
                Subscription Plans
              </h1>
              <p>Choose the perfect plan for your financial journey</p>
            </div>
            <div className="header-actions">
              <button 
                className="primary-button"
                onClick={handleContinue} 
                disabled={isButtonDisabled()}
              >
                {getButtonLabel()}
              </button>
              <button 
                className="secondary-button" 
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="tier-options">
            {TIERS.map((tier, index) => (
              <motion.div
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`tier-card ${selectedTier === tier ? "selected" : ""} ${currentTier === tier ? "current" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {currentTier === tier && (
                  <div className="current-bookmark">
                    <span>Current Plan</span>
                  </div>
                )}
                
                <div className="tier-header">
                  <div className="tier-icon">
                    {tier === "free" && <Check size={24} />}
                    {tier === "plus" && <Star size={24} />}
                    {tier === "premium" && <CreditCard size={24} />}
                  </div>
                  <h2>{capitalize(tier)}</h2>
                </div>
                
                <div className="tier-price">
                  <span className="currency">₹</span>
                  <span className="amount">
                    {tier === "free" ? "0" : tier === "plus" ? "99" : "199"}
                  </span>
                  <span className="period">/ month</span>
                </div>

                <ul className="tier-features">
                  {TIER_FEATURES[tier].map((feature, idx) => (
                    <li key={idx}>
                      <Check size={16} className="feature-check" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {user && (
            <motion.div
              className="subscription-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3>Account Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Name:</span>
                  <span className="value">{user.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Contact:</span>
                  <span className="value">{user.contact || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Current Plan:</span>
                  <span className="value plan-badge">{capitalize(user.tier)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Subscription ID:</span>
                  <span className="value">{user.subscriptionId || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Payment ID:</span>
                  <span className="value">{user.paymentId || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Next Due Date:</span>
                  <span className="value">{getReadableDate(user.expiresAt)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
};

export default MakePayment;
