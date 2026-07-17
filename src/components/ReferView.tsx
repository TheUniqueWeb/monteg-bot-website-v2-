import { useState, useEffect } from "react";
import { User, AppConfig } from "../types";
import { Users, Copy, Check, Info, Award, UserCheck, Calendar } from "lucide-react";

interface ReferViewProps {
  user: User;
  config: AppConfig;
}

interface ReferralSummary {
  id: string;
  full_name: string;
  username: string;
  join_date: string;
}

export default function ReferView({ user, config }: ReferViewProps) {
  const [referrals, setReferrals] = useState<ReferralSummary[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Derive referral link using APP_URL or window location
  const appUrl = window.location.origin;
  const referLink = `${appUrl}?ref=${user.id}`;

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/user/${user.id}/referrals`);
        if (res.ok) {
          const data = await res.json();
          setReferrals(data);
        }
      } catch (err) {
        console.error("Failed to load referrals:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferrals();
  }, [user.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="refer-view-container" className="space-y-4 pb-6">
      {/* Referral Stats Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Referral Network</h3>
          <h2 className="text-xl font-black mt-1">
            {referrals.length} <span className="text-xs text-slate-500 font-normal">Referred Users</span>
          </h2>
          <div className="mt-1.5 text-xs font-medium text-slate-400 flex items-center">
            <Award className="w-4 h-4 mr-1 text-amber-500" />
            <span>Profit: <span className="text-white font-bold">৳{user.refer_balance.toFixed(2)}</span></span>
          </div>
        </div>
        <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 shrink-0">
          <Users className="w-5 h-5 text-indigo-400" />
        </div>
      </div>

      {/* Copy Link Widget */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Share & Earn Commission</h4>
        <p className="text-xs text-slate-500 leading-normal">
          Invite friends using your unique link. You will earn{" "}
          <span className="font-bold text-blue-600">৳{config.refer_reward.toFixed(2)}</span> instantly upon registration.
        </p>

        <div className="flex space-x-2 pt-1">
          <input
            type="text"
            readOnly
            value={referLink}
            className="w-full bg-slate-50 border border-slate-100 text-slate-500 rounded-lg px-3 py-2 text-xs focus:outline-hidden font-mono truncate"
          />
          <button
            onClick={handleCopyLink}
            className={`px-3.5 rounded-lg font-bold text-xs flex items-center space-x-1 transition-colors shrink-0 ${
              copied
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Policy banner */}
      <div className="bg-blue-50/40 border border-blue-50 py-3 px-4 rounded-xl flex items-start space-x-2.5 text-xs text-blue-800/90">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="leading-normal">
          <span className="font-bold text-blue-900">Anti-Fraud Protection:</span> Fake or multi-account referrals will lead to an automatic, permanent suspension. Play fair!
        </p>
      </div>

      {/* Refer List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">My Referral List</h3>
          <span className="text-[10px] text-slate-400 font-bold">{referrals.length} accounts</span>
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-50 rounded-xl p-6 text-center text-xs text-slate-400">
            Loading referrals...
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 text-center py-10 rounded-xl text-slate-400 text-xs">
            No referrals yet. Copy link to start earning.
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50 shadow-xs">
            {referrals.map((ref) => (
              <div key={ref.id} id={`referral-row-${ref.id}`} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-50 text-slate-500 p-2 rounded-lg border border-slate-100">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{ref.full_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      @{ref.username || "no_username"} • ID: {ref.id}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 flex items-center space-x-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-300" />
                  <span>{new Date(ref.join_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
