import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./MakePayment.scss";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CreditCard, Check, Star, Crown } from "lucide-react";

const TIERS = ["free", "plus", "premium"] as const;
type Tier = (typeof TIERS)[number];

const TIER_FEATURES: Record<Tier, string[]> = {
  free: [
    // "User registration and login",
    "Manage income and expenses",
    "View list of transactions",
    "View basic monthly summary (total income and expenses)",
  ],
  plus: [
    "All Free features",
    "Set and track budgets",
    "Category-wise analytics (charts)",
    // "Download reports in .txt format",
    "View spending trends by category",
  ],
  premium: [
    "All Plus features",
    // "Advanced reports in downloadable PDF format",
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
  const [processStep, setProcessStep] = useState<string>("");
  const [showProcessDialog, setShowProcessDialog] = useState(false);
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
      setShowProcessDialog(true);
      setProcessStep("Cancelling your subscription...");
      
      try {
        await axios.post(
          `${backendURL}/cancel-subs/${user._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProcessStep("Subscription cancelled successfully!");
        setTimeout(() => {
          alert("Subscription Cancelled. Downgraded to Free.");
          setCurrentTier("free");
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Error cancelling subscription:", error);
        setProcessStep("Failed to cancel subscription");
        setTimeout(() => {
          alert("Failed to cancel subscription. Please try again.");
          setShowProcessDialog(false);
          setLoading(false);
        }, 1500);
      }
    } else {
      setLoading(true);
      setShowProcessDialog(true);
      
      try {
        // Step 1: Cancel current subscription if user has an ongoing subscription (not free)
        if (user.tier !== "free") {
          setProcessStep(`Cancelling current ${capitalize(user.tier)} subscription...`);
          console.log(`Cancelling current ${user.tier} subscription...`);
          await axios.post(
            `${backendURL}/cancel-subs/${user._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Current subscription cancelled successfully");
          await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX
        }

        // Step 2: Create new subscription
        setProcessStep(`Creating ${capitalize(selectedTier)} subscription...`);
        console.log(`Creating new ${selectedTier} subscription...`);
        const subsRes = await axios.post(
          `${backendURL}/create-subscription`,
          { tier: selectedTier },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { id: subscription_id } = subsRes.data;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX

        // Step 3: Open Razorpay popup for payment
        setProcessStep("Opening payment gateway...");
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        
        const options = {
          key: import.meta.env.RAZORPAY_KEY_ID,
          name: "Spendly",
          description: `${user.tier === "free" ? "Upgrade" : user.tier === selectedTier ? "Renew" : "Change plan"} to ${selectedTier}`,
          subscription_id,
          handler: async function (response: any) {
            setProcessStep("Verifying payment...");
            try {
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

              setProcessStep("Payment verified successfully!");
              setTimeout(() => {
                alert(`Successfully ${user.tier === "free" ? "upgraded" : "changed plan"} to ${selectedTier}`);
                setCurrentTier(selectedTier);
                window.location.reload();
              }, 1000);
            } catch (error) {
              console.error("Error verifying payment:", error);
              setProcessStep("Payment verification failed");
              setTimeout(() => {
                alert("Payment verification failed. Please contact support.");
                setShowProcessDialog(false);
                setLoading(false);
              }, 1500);
            }
          },
          modal: {
            ondismiss: function() {
              console.log("Payment modal dismissed");
              setProcessStep("");
              setShowProcessDialog(false);
              setLoading(false);
            }
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
        setShowProcessDialog(false); // Hide dialog when payment popup opens
        setLoading(false);
        
      } catch (error) {
        console.error("Error in subscription process:", error);
        setProcessStep("Failed to process subscription");
        setTimeout(() => {
          alert("Failed to process subscription. Please try again.");
          setShowProcessDialog(false);
          setLoading(false);
        }, 1500);
      }
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
      {/* Process Dialog */}
      {showProcessDialog && (
        <div className="process-dialog-overlay">
          <motion.div 
            className="process-dialog"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="process-content">
              <div className="process-loader">
                <div className="spinner"></div>
              </div>
              <h3>Processing Your Request</h3>
              <p className="process-step">{processStep}</p>
            </div>
          </motion.div>
        </div>
      )}

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
                    {tier === "premium" && <Crown size={24} />}
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
