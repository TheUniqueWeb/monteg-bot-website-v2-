import React, { useState, useEffect } from "react";
import { Trophy, Award, Sparkles, RefreshCw } from "lucide-react";

interface LeaderboardUser {
  id: string;
  full_name: string;
  username: string;
  total_balance: number;
  profile_photo_url?: string;
  join_date: string;
}

export default function TopEarners() {
  const [earners, setEarners] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTopEarners = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await fetch("/api/top-earners");
      if (!res.ok) throw new Error("Could not fetch leaderboard statistics.");
      const data = await res.json();
      setEarners(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopEarners();
  }, []);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Trophy className="w-4 h-4 fill-amber-500/20" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
              <span>Top Earners League</span>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">Real-time reward payouts</p>
          </div>
        </div>
        
        <button
          onClick={() => fetchTopEarners(true)}
          disabled={loading || isRefreshing}
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 hover:text-slate-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
        </button>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="space-y-2.5 py-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-slate-100 rounded-full" />
                <div className="w-10 h-10 bg-slate-100 rounded-full" />
                <div className="space-y-1.5">
                  <div className="w-24 h-3 bg-slate-100 rounded-md" />
                  <div className="w-16 h-2.5 bg-slate-50 rounded-md" />
                </div>
              </div>
              <div className="w-12 h-4 bg-slate-100 rounded-md" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4 text-rose-500 text-[11px] font-bold">
          {error}
        </div>
      ) : earners.length === 0 ? (
        <div className="text-center py-4 text-slate-400 text-[11px] font-bold">
          No participants in the league yet. Be the first!
        </div>
      ) : (
        /* Top 10 List */
        <div className="divide-y divide-slate-50">
          {earners.map((earner, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            
            // Theme setup for top 3
            let rankBadge = "";
            let trophyColor = "";
            if (rank === 1) {
              rankBadge = "bg-yellow-500 text-white font-black scale-105 shadow-sm shadow-yellow-500/20";
              trophyColor = "text-yellow-500";
            } else if (rank === 2) {
              rankBadge = "bg-slate-400 text-white font-black";
              trophyColor = "text-slate-400";
            } else if (rank === 3) {
              rankBadge = "bg-amber-600 text-white font-black";
              trophyColor = "text-amber-600";
            } else {
              rankBadge = "bg-slate-100 text-slate-500 font-bold";
            }

            return (
              <div
                key={earner.id}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 group transition-colors hover:bg-slate-50/40 px-1 rounded-lg"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Rank indicator */}
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${rankBadge}`}>
                    {rank}
                  </div>

                  {/* Profile photo with rank trophy fallback */}
                  <div className="relative shrink-0">
                    <img
                      src={earner.profile_photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                      alt={earner.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                      }}
                    />
                    {isTop3 && (
                      <span className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs border border-slate-100">
                        <Award className={`w-3 h-3 ${trophyColor} fill-current`} />
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-800 truncate tracking-tight">
                      {earner.full_name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">
                      @{earner.username || `user_${earner.id}`}
                    </div>
                  </div>
                </div>

                {/* Earnings amount */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-blue-600 tracking-tight">
                    ৳{earner.total_balance.toFixed(2)}
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-widest font-black">
                    Earned
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
