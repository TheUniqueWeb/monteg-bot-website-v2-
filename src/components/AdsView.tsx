import React, { useState } from "react";
import { User, Ad, AppConfig } from "../types";
import { Tv, Play, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Flame, Clock } from "lucide-react";

interface AdsViewProps {
  user: User;
  ads: Ad[];
  completedAdIds: string[];
  config: AppConfig;
  onAdCompleted: (updatedUser: User, adId: string) => void;
}

export default function AdsView({ user, ads, completedAdIds, config, onAdCompleted }: AdsViewProps) {
  const [activeAd, setActiveAd] = useState<Ad | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReward, setSuccessReward] = useState<number | null>(null);

  // Helper to execute/inject Monetag ad code
  const executeAdCode = () => {
    const code = config.monteg_link || "https://monetag.com";
    if (!code) return;

    if (code.includes("<script") || code.includes("javascript:") || !code.trim().startsWith("http")) {
      // It looks like a custom script tag or inline JS block!
      try {
        const cleanCode = code.replace(/<script[^>]*>/gi, "").replace(/<\/script>/gi, "");
        
        // Check if there is an external source URL in the tag
        const srcMatch = code.match(/src=["']([^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
          const script = document.createElement("script");
          script.src = srcMatch[1];
          script.async = true;
          
          // Copy any zone attributes
          const zoneMatch = code.match(/data-zone=["']([^"']+)["']/i);
          if (zoneMatch && zoneMatch[1]) {
            script.setAttribute("data-zone", zoneMatch[1]);
          }
          
          document.body.appendChild(script);
        } else {
          // Eval direct JS safely
          const script = document.createElement("script");
          script.text = cleanCode;
          document.body.appendChild(script);
        }
      } catch (err) {
        console.error("Failed to execute custom ad script:", err);
      }
    } else {
      // Standard Monetag Direct Link / Smartlink. Open in a new tab!
      try {
        window.open(code.trim(), "_blank");
      } catch (e) {
        console.warn("Popup blocked or failed to open; continuing session.", e);
      }
    }
  };

  const triggerAdPlacement = () => {
    // Check if user reached the limit
    if (completedAdIds.length >= config.ad_limit) {
      setError(`Daily limit reached! You can watch up to ${config.ad_limit} ads per day.`);
      return;
    }

    // Find the first ad in the pool that hasn't been completed by this user today
    const nextAd = ads.find((ad) => !completedAdIds.includes(ad.id)) || (ads.length > 0 ? ads[0] : null);

    if (!nextAd) {
      setError("No active Monetag ad unit is available at this moment. Check back later!");
      return;
    }

    setError(null);
    setSuccessReward(null);
    setActiveAd(nextAd);
    setCountdown(nextAd.duration || 10);
    setIsWatching(true);

    // Execute the ad integration code (Smartlink redirect or tag inject)
    executeAdCode();

    // Start countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeAdWatch(nextAd);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeAdWatch = async (ad: Ad) => {
    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, adId: ad.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessReward(data.reward);
        onAdCompleted(data.user, ad.id);
      } else {
        setError(data.error || "Failed to reward ad view.");
      }
    } catch (err) {
      setError("Network connection issue. Please try again.");
    } finally {
      setIsWatching(false);
    }
  };

  const closeOverlay = () => {
    setActiveAd(null);
    setIsWatching(false);
    setSuccessReward(null);
    setError(null);
  };

  const isLimitReached = completedAdIds.length >= config.ad_limit;

  return (
    <div id="ads-view-container" className="space-y-5 pb-6 px-1 animate-fade-in flex flex-col justify-between">
      {/* 1. Overview Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-12 -mt-12 blur-lg animate-pulse" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Active Monetization</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {completedAdIds.length} <span className="text-xs text-slate-500 font-bold">/ {config.ad_limit} Ads</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">
            Earn flat <span className="text-white font-bold">৳{config.per_ad_amount.toFixed(2)}</span> per verified Monetag placement
          </p>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/60 shrink-0 relative z-10">
          <Tv className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      {/* Error notification display */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start space-x-3 text-rose-800 animate-slide-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="text-xs font-bold">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-rose-600 underline mt-1.5 font-black block">
              Dismiss Notification
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN AD LAUNCH TARGET CARD */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden min-h-[250px]">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />
        
        {/* Verification seal */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure Monetag Ad Network</span>
        </div>

        {/* Central interactive area */}
        <div className="space-y-2 z-10">
          <h3 className="text-base font-black text-slate-800 tracking-tight">Monetag Smart Monetization</h3>
          <p className="text-[11px] text-slate-400 leading-normal max-w-xs">
            {isLimitReached
              ? "You have watched all available sponsored placements for today. Please come back tomorrow to earn more!"
              : "Click the trigger button below to launch a sponsored Monetag placement. Remain on the ad tab to earn your reward!"}
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-xs z-10">
          {isLimitReached ? (
            <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center justify-center space-x-2.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-black">All Completed Today!</p>
                <p className="text-[9px] text-emerald-600 font-bold">Earned total: ৳{(completedAdIds.length * config.per_ad_amount).toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={triggerAdPlacement}
              disabled={isWatching}
              className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black py-4 px-6 rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2.5 transition-all active:scale-98 group cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-250" />
              <span className="text-xs tracking-wider uppercase">Watch Sponsored Ad & Earn</span>
            </button>
          )}
        </div>

        {/* Helper footer inside card */}
        {!isLimitReached && (
          <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-bold z-10">
            <span className="flex items-center">
              <Flame className="w-3 h-3 text-amber-500 mr-1 animate-pulse" /> Instant Credit
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 text-slate-400 mr-1" /> ~10s stream
            </span>
          </div>
        )}
      </div>

      {/* 3. Helpful Info Panel */}
      <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 flex items-start space-x-3 text-slate-600">
        <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-wider">How to earn from Monetag?</h4>
          <p className="text-[10px] text-slate-500 leading-normal">
            We partner with Monetag publisher system to serve high-paying CPM ads. When you trigger the ad placement, a sponsor window opens. Return to this app, complete the timer, and receive instant balance instantly deposited into your payout wallet.
          </p>
        </div>
      </div>

      {/* 4. STREAMING FULLSCREEN COUNTDOWN OVERLAY */}
      {activeAd && (isWatching || successReward) && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-50 flex flex-col justify-between p-6 text-white animate-fade-in">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="text-xs font-black tracking-widest uppercase text-blue-400">Monetag Ad Engine</span>
            </div>
            {!isWatching && (
              <button
                onClick={closeOverlay}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            )}
          </div>

          {/* Central Progress Core */}
          <div className="my-auto flex flex-col items-center text-center space-y-7">
            {isWatching ? (
              <>
                {/* Visual Video Player Simulation Frame */}
                <div className="w-full max-w-sm aspect-video bg-slate-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center relative shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-indigo-900/10 to-slate-950 animate-pulse" />
                  <div className="relative z-10 space-y-4 px-6 text-center">
                    <div className="w-14 h-14 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs text-blue-400 font-black tracking-wider uppercase">Active Monetag Placement</p>
                      <p className="text-[11px] text-slate-400 leading-normal max-w-[240px] mx-auto">
                        Your ad code or smartlink is executing safely in your browser tab. Do not close to receive reward.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Circle & Countdown Timer */}
                <div className="space-y-3 flex flex-col items-center">
                  <div className="relative flex items-center justify-center w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="#2563eb"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray="213.6"
                        strokeDashoffset={213.6 - (213.6 * ((activeAd.duration || 10) - countdown)) / (activeAd.duration || 10)}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <span className="absolute text-xl font-black tracking-tighter text-blue-400">{countdown}s</span>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] text-slate-400 font-bold">
                    <span>Reward on complete:</span>
                    <span className="text-blue-400 font-black">৳{config.per_ad_amount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              /* Success Reward claim frame */
              <div className="bg-white text-slate-800 p-8 rounded-3xl max-w-sm w-full space-y-6 shadow-2xl animate-[bounce_1s_ease-in-out] border border-slate-100">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Reward Deposited!</h3>
                  <p className="text-xs text-slate-400 font-bold leading-normal">
                    The Monetag publisher network has successfully verified your view transaction.
                  </p>
                </div>
                <div className="bg-blue-50 py-4 px-6 rounded-2xl border border-blue-100">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Wallet Balance Added</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tight">+৳{successReward?.toFixed(2)}</span>
                </div>
                <button
                  onClick={closeOverlay}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md text-xs tracking-wider uppercase cursor-pointer"
                >
                  Claim & Return
                </button>
              </div>
            )}
          </div>

          {/* Footer branding */}
          <div className="text-center text-[9px] text-slate-600 font-bold tracking-widest uppercase flex items-center justify-center space-x-1">
            <span>Powered by Monetag Organic Publisher Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
