import React, { useState, useEffect } from "react";
import { User, Withdrawal, AppConfig } from "../types";
import { Wallet, AlertCircle, CheckCircle, Clock, XCircle, ArrowUpRight, HelpCircle } from "lucide-react";

interface WithdrawViewProps {
  user: User;
  config: AppConfig;
  onWithdrawSubmitted: (updatedUser: User) => void;
}

type PaymentMethod = "Bkash" | "Nagad" | "Rocket";

export default function WithdrawView({ user, config, onWithdrawSubmitted }: WithdrawViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [withdrawNumber, setWithdrawNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods: { id: PaymentMethod; label: string; color: string; hover: string; textColor: string; icon: string }[] = [
    {
      id: "Bkash",
      label: "bKash",
      color: "bg-pink-50 border-pink-100 text-pink-600",
      hover: "hover:border-pink-300",
      textColor: "text-pink-700",
      icon: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=100", // placeholder or simple styled text
    },
    {
      id: "Nagad",
      label: "Nagad",
      color: "bg-orange-50 border-orange-100 text-orange-600",
      hover: "hover:border-orange-300",
      textColor: "text-orange-700",
      icon: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=100",
    },
    {
      id: "Rocket",
      label: "Rocket",
      color: "bg-purple-50 border-purple-100 text-purple-600",
      hover: "hover:border-purple-300",
      textColor: "text-purple-700",
      icon: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    },
  ];

  const fetchWithdrawals = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`/api/user/${user.id}/withdrawals`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load withdrawal history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user.id]);

  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedMethod) {
      setError("Please choose a payment gateway (bKash, Nagad, or Rocket).");
      return;
    }

    if (!withdrawNumber.trim()) {
      setError("Please provide a valid withdrawal wallet number.");
      return;
    }

    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid numeric amount.");
      return;
    }

    if (withdrawAmount < config.min_withdraw) {
      setError(`Minimum withdrawal limit is ৳${config.min_withdraw.toFixed(2)}.`);
      return;
    }

    if (user.total_balance < withdrawAmount) {
      setError("Insufficient available balance for this withdrawal.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          number: withdrawNumber.trim(),
          paymentMethod: selectedMethod,
          amount: withdrawAmount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Withdrawal of ৳${withdrawAmount.toFixed(2)} successfully queued!`);
        setAmount("");
        setWithdrawNumber("");
        setSelectedMethod(null);
        onWithdrawSubmitted(data.user);
        fetchWithdrawals(); // refresh history list
      } else {
        setError(data.error || "Failed to process withdrawal request.");
      }
    } catch (err) {
      setError("Connection timed out. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    setAmount(user.total_balance.toString());
  };

  return (
    <div id="withdraw-view-container" className="space-y-4 pb-6">
      {/* Balance Indicator card */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Withdrawable Balance</h3>
          <h2 className="text-2xl font-black mt-1">৳{user.total_balance.toFixed(2)}</h2>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Minimum limit: ৳{config.min_withdraw.toFixed(2)}</span>
          </p>
        </div>
        <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 shrink-0">
          <Wallet className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Withdraw Submission form */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Withdraw Funds Gateway</h3>

        {error && (
          <div className="bg-rose-50/50 border border-rose-100 text-rose-800 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmitWithdraw} className="space-y-4">
          {/* Payment method selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choose Gateway Provider</label>
            <div className="grid grid-cols-3 gap-2.5">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    id={`payment-btn-${method.id}`}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      isSelected
                        ? "ring-2 ring-blue-500/20 border-blue-500 bg-blue-50/20 text-blue-700 font-bold"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-bold">{method.label}</span>
                    <span className="text-[8px] font-medium text-slate-400">Merchant</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account number */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Withdrawal Number (Mobile / Wallet Account)</label>
            <input
              type="tel"
              required
              value={withdrawNumber}
              onChange={(e) => setWithdrawNumber(e.target.value)}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-all font-mono"
            />
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount (৳)</label>
              <button
                type="button"
                onClick={setMaxAmount}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Withdraw Max
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ৳${config.min_withdraw.toFixed(2)}`}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-7 pr-16 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-mono"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
              <button
                type="button"
                onClick={setMaxAmount}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded border border-blue-100"
              >
                Max
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors text-xs flex items-center justify-center space-x-2 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Submit Withdrawal Request</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* History Area */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Withdrawal Transaction History</h3>

        {isLoadingHistory ? (
          <div className="bg-white border border-slate-50 rounded-xl p-6 text-center text-xs text-slate-400">
            Loading transaction logs...
          </div>
        ) : history.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 text-center py-10 rounded-xl text-slate-400 text-xs">
            No withdrawal records found yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((wd) => {
              const statusColor =
                wd.status === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100/60"
                  : wd.status === "rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-100/60"
                  : "bg-amber-50 text-amber-700 border-amber-100/60";

              const StatusIcon =
                wd.status === "approved"
                  ? CheckCircle
                  : wd.status === "rejected"
                  ? XCircle
                  : Clock;

              return (
                <div
                  key={wd.id}
                  id={`withdraw-card-${wd.id}`}
                  className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 border border-slate-100">
                        {wd.payment_method}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 font-mono">{wd.number}</h4>
                        <p className="text-[10px] text-slate-400">
                          {new Date(wd.submitted_at).toLocaleDateString()} • {new Date(wd.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-800 block">৳{wd.amount.toFixed(2)}</span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center space-x-1 border uppercase ${statusColor}`}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        <span>{wd.status}</span>
                      </span>
                    </div>
                  </div>

                  {wd.status === "rejected" && wd.rejection_reason && (
                    <div className="bg-rose-50/50 border border-rose-100/50 p-2 rounded-lg text-[10px] text-rose-700 font-medium">
                      <span className="font-bold">Reason:</span> {wd.rejection_reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
