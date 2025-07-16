import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./MakePayment.scss";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please login again.");
      return;
    }

    axios
      .get(`${backendURL}/getuserinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCurrentTier(res.data.user.tier);
        setSelectedTier(res.data.user.tier);
        setUserId(res.data.user._id);
      })
      .catch(() => alert("Failed to fetch user info"));
  }, []);

  const handleContinue = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedTier || !userId) return;

    if (selectedTier === "free") {
      await axios.post(
        `${backendURL}/cancel-subs/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Subscription Cancelled. Downgraded to Free.");
      setCurrentTier("free");
    } else {
      const subsRes = await axios.post(
        `${backendURL}/create-subscription`,
        { tier: selectedTier },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: subscription_id } = subsRes.data;

      const options = {
        key: "rzp_test_PBJkLnUbQSrahI",
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
          email: "",
        },
        theme: {
          color: "#2e97cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    }
  };

  return (
    <div className="payment-container">
      <h1>Choose Your Plan</h1>
      <div className="tier-options">
        {TIERS.map((tier) => (
          <div
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`tier-card ${selectedTier === tier ? "selected" : ""}`}
          >
            <h2>{tier.charAt(0).toUpperCase() + tier.slice(1)}</h2>
            <ul>
              {TIER_FEATURES[tier].map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            {tier !== "free" && <p>₹{tier === "plus" ? 99 : 199}</p>}
            {currentTier === tier && <span>Current Plan</span>}
          </div>
        ))}
      </div>
      <button
        onClick={handleContinue}
        disabled={!selectedTier || selectedTier === currentTier || !userId}
      >
        Continue
      </button>
    </div>
  );
};

export default MakePayment;
