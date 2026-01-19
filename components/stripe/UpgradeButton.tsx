"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";
import { toast, ToastContainer } from "react-toastify";
import { useUser } from "@/context/UserContext";

const PLAN_ORDER = ["Free", "Starter", "Team", "Agency"];

type UpgradeButtonProps = {
  teamId?: string;
  priceId: string;
  planName: string;
  currentPlan: string,
  onClick?: () => void;
  className?: string;
  disabled: boolean;
};

export default function UpgradeButton(props: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const token = getToken();
  const { refreshUser } = useUser();
  const { onClick, teamId, priceId, planName, currentPlan, className, disabled } = props;

  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const targetIndex = PLAN_ORDER.indexOf(planName);
  const action = targetIndex > currentIndex ? "Upgrade" : "Downgrade";


  async function handleUpgrade() {
    try {
      setLoading(true);
      onClick?.();

      const res = await fetch("https://qa-backend-105l.onrender.com/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId, priceId }),
      });

      const data = await res.json();

      // ⭐ handle both cases
      if (data.url) {
        // New subscription → redirect to Stripe Checkout
        window.location.href = data.url;
        setLoading(false);
      } else if (data.status === "updated") {
        // Existing subscription updated → show success toast or reload page
        setLoading(false);
        await refreshUser(); 
        // Optionally refresh page or refetch team data here
        // window.location.reload();
      } else {
        setLoading(false);
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  
  return (
        <button
        className={className}
        onClick={handleUpgrade}
        disabled={loading || disabled}
        >
        {loading ? "Upgrading…" : `${action} to ${planName}`}
        </button>
  );
}
