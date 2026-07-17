import React, { useState, useEffect } from "react";
import { User, Banner, AppConfig } from "../types";
import { Tv, ClipboardList, Users, Wallet, Headphones, ChevronLeft, ChevronRight, MessageCircle, Star, Sparkles, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import TopEarners from "./TopEarners";

interface Tier {
  name: string;
  minBalance: number;
  commission: string;
  colorClass: string;
  badgeBg: string;
  textColor: string;
  nextTier?: string;
  nextMin?: number;
}

const TIERS: Tier[] = [
  { name: "Bronze", minBalance: 0, commission: "5%", colorClass: "from-amber-700 via-amber-800 to-amber-900 border-amber-600/40 shadow-amber-900/10", badgeBg: "bg-amber-500/20 text-amber-300", textColor: "text-amber-200", nextTier: "Silver", nextMin: 10 },
  { name: "Silver", minBalance: 10, commission: "7%", colorClass: "from-slate-600 via-slate-700 to-slate-800 border-slate-500/40 shadow-slate-900/10", badgeBg: "bg-slate-500/20 text-slate-300", textColor: "text-slate-200", nextTier: "Gold", nextMin: 50 },
  { name: "Gold", minBalance: 50, commission: "10%", colorClass: "from-yellow-600 via-amber-600 to-yellow-700 border-yellow-500/40 shadow-yellow-500/10", badgeBg: "bg-yellow-500/20 text-yellow-300", textColor: "text-yellow-100", nextTier: "Platinum", nextMin: 150 },
  { name: "Platinum", minBalance: 150, commission: "12%", colorClass: "from-teal-600 via-cyan-700 to-blue-700 border-teal-500/40 shadow-teal-500/10", badgeBg: "bg-teal-500/20 text-teal-300", textColor: "text-teal-200", nextTier: "Diamond", nextMin: 300 },
  { name: "Diamond", minBalance: 300, commission: "15%", colorClass: "from-indigo-600 via-purple-700 to-pink-700 border-indigo-500/40 shadow-indigo-500/10", badgeBg: "bg-indigo-500/20 text-indigo-300", textColor: "text-indigo-200", nextTier: "Pro", nextMin: 500 },
  { name: "Pro", minBalance: 500, commission: "20%", colorClass: "from-slate-900 via-slate-950 to-slate-900 border-yellow-500/30 shadow-slate-950/20", badgeBg: "bg-yellow-500/20 text-yellow-400", textColor: "text-yellow-100" }
];

function getTier(balance: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (balance >= TIERS[i].minBalance) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

interface HomeViewProps {
  user: User;
  banners: Banner[];
  config: AppConfig;
  setActiveTab: (tab: string) => void;
}

export default function HomeView({ user, banners, config, setActiveTab }: HomeViewProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showRates, setShowRates] = useState(false);

  // Auto-slide banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const balanceCards = [
    {
      id: "card-ad",
      title: "Ad Balance",
      value: `৳${user.ad_balance.toFixed(2)}`,
      icon: Tv,
      color: "bg-slate-50 border-slate-100/70 hover:border-blue-200 text-blue-600",
      description: "Earned watching Monteg ads",
      actionLabel: "Watch Ads",
      tab: "ads",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100"
    },
    {
      id: "card-task",
      title: "Task Balance",
      value: `৳${user.task_balance.toFixed(2)}`,
      icon: ClipboardList,
      color: "bg-slate-50 border-slate-100/70 hover:border-emerald-200 text-emerald-600",
      description: "Earned completing tasks",
      actionLabel: "View Tasks",
      tab: "tasks",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100"
    },
    {
      id: "card-refer",
      title: "Refer Balance",
      value: `৳${user.refer_balance.toFixed(2)}`,
      icon: Users,
      color: "bg-slate-50 border-slate-100/70 hover:border-indigo-200 text-indigo-600",
      description: "Earned from referrals",
      actionLabel: "Invite Friends",
      tab: "refer",
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100"
    },
    {
      id: "card-total",
      title: "Total Balance",
      value: `৳${user.total_balance.toFixed(2)}`,
      icon: Wallet,
      color: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-blue-700 shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-200 transition-all",
      description: "Available for withdrawal",
      actionLabel: "Withdraw Now",
      tab: "withdraw",
      iconBg: "bg-white/15 text-white border border-white/10"
    },
  ];

  return (
    <div id="home-view-container" className="space-y-4 pb-6 px-1">
      {/* 1. Header with Avatar & Greeting */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -mr-8 -mt-8" />
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="relative cursor-pointer" onClick={() => setActiveTab("profile")}>
            <img
              src={user.profile_photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
              alt="Profile Avatar"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/15 transition-transform hover:scale-105 active:scale-95"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
              }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setActiveTab("profile")}>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Publisher</span>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            </div>
            <div className="text-sm font-black text-slate-800 tracking-tight cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setActiveTab("profile")}>
              {user.full_name}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg font-bold">
          ID: {user.id}
        </div>
      </div>

      {/* 2. Scrolling Marquee Notice Area (SLOW) */}
      <div className="bg-amber-500/10 py-2.5 px-4 overflow-hidden border border-amber-500/15 rounded-xl flex items-center space-x-2">
        <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 animate-pulse animate-[pulse_2s_infinite]">
          Notice
        </span>
        <div className="w-full overflow-hidden relative h-4">
          <div className="absolute whitespace-nowrap animate-[marquee_30s_linear_infinite] text-[11px] text-amber-800 font-bold hover:pause">
            🔥 {config.scrolling_notice}
          </div>
        </div>
      </div>

      {/* Dynamic Membership Level Card */}
      <div className={`relative rounded-3xl p-5 bg-gradient-to-br text-white shadow-xl border overflow-hidden transition-all duration-300 ${getTier(user.total_balance).colorClass}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-lg pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className={`text-[9px] font-black tracking-widest uppercase opacity-75 ${getTier(user.total_balance).textColor}`}>
                  Publisher Membership
                </span>
                <h3 className="text-sm font-black tracking-tight flex items-center space-x-1.5">
                  <span>{getTier(user.total_balance).name} Level</span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${getTier(user.total_balance).badgeBg}`}>
                    {getTier(user.total_balance).commission} Refer Comm
                  </span>
                </h3>
              </div>
            </div>
            
            <button
              onClick={() => setShowRates(!showRates)}
              className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg border border-white/10 transition-all flex items-center space-x-1 cursor-pointer select-none"
            >
              <span>Rates</span>
              {showRates ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          </div>

          {/* Card Info Details */}
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider text-white/60 font-bold">Account Holder</p>
              <p className="text-xs font-black tracking-tight">{user.full_name}</p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider text-white/60 font-bold">Mobile</p>
              <p className="text-xs font-mono font-bold">{user.mobile || "Unlinked"}</p>
            </div>
          </div>

          {/* Progress Section to next level */}
          {getTier(user.total_balance).nextTier && getTier(user.total_balance).nextMin && (
            <div className="space-y-1.5 pt-1 border-t border-white/10">
              <div className="flex justify-between text-[9px] font-bold">
                <span className="opacity-85">Next Level: {getTier(user.total_balance).nextTier}</span>
                <span className="opacity-95">৳{user.total_balance.toFixed(2)} / ৳{getTier(user.total_balance).nextMin?.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-black/25 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-300 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, (user.total_balance / (getTier(user.total_balance).nextMin || 1)) * 100))}%` }}
                />
              </div>
              <p className="text-[8.5px] text-white/70 text-right leading-tight font-medium">
                Earn ৳{((getTier(user.total_balance).nextMin || 0) - user.total_balance).toFixed(2)} more to auto-unlock high commission bonuses!
              </p>
            </div>
          )}

          {/* Expanded Rates and Commission list (সবগুলো কমিশন রয়েছে) */}
          {showRates && (
            <div className="pt-3 border-t border-white/10 space-y-2 text-slate-100 animate-slide-in">
              <p className="text-[9.5px] font-black uppercase tracking-wider text-blue-300">
                ⭐ Level commission program details (সবগুলোতে কমিশন রয়েছে):
              </p>
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                {TIERS.map((t) => {
                  const isCurrent = t.name === getTier(user.total_balance).name;
                  return (
                    <div 
                      key={t.name} 
                      className={`p-2 rounded-xl border flex items-center justify-between ${
                        isCurrent 
                          ? "bg-white/20 border-white/25 text-white font-black animate-pulse" 
                          : "bg-black/15 border-white/5 text-white/80"
                      }`}
                    >
                      <span className="flex items-center space-x-1">
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />}
                        <span>{t.name}</span>
                      </span>
                      <span>{t.commission}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[8px] text-white/60 text-center font-bold">
                * Rates apply automatically to all earnings & task referrals.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Interactive Image Slider */}
      {banners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 group border border-slate-200/50 shadow-xs">
          <a
            href={banners[currentBannerIndex].link_url || config.monteg_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >
            <img
              src={banners[currentBannerIndex].image_url}
              alt={banners[currentBannerIndex].title || "Promo banner"}
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
              <span className="inline-flex items-center space-x-1 bg-blue-600 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full mb-1">
                <Star className="w-2 h-2 fill-current" />
                <span>Premium Campaign</span>
              </span>
              <h3 className="text-xs font-black truncate mt-1 text-white leading-tight">
                {banners[currentBannerIndex].title}
              </h3>
            </div>
          </a>

          {banners.length > 1 && (
            <>
              <button
                onClick={handlePrevBanner}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-950/40 hover:bg-slate-950/60 text-white p-1.5 rounded-full backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextBanner}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-950/40 hover:bg-slate-950/60 text-white p-1.5 rounded-full backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {/* Dots indicator */}
              <div className="absolute bottom-4 right-4 flex space-x-1 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentBannerIndex ? "bg-blue-500 w-4" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Earnings Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {balanceCards.map((card) => {
          const isTotal = card.id === "card-total";
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              onClick={() => setActiveTab(card.tab)}
              className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all active:scale-[0.97] group relative overflow-hidden ${card.color}`}
            >
              {isTotal && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4" />
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${card.iconBg} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${isTotal ? "text-blue-100/80" : "text-slate-400"}`}>
                    Monteg Pay
                  </span>
                </div>
                <div>
                  <div className={`text-[9px] font-bold uppercase tracking-wider ${isTotal ? "text-blue-100/90" : "text-slate-400"}`}>
                    {card.title}
                  </div>
                  <div className={`text-lg font-black tracking-tight mt-0.5 ${isTotal ? "text-white" : "text-slate-800"}`}>
                    {card.value}
                  </div>
                </div>
              </div>
              <div className={`text-[10px] mt-4 font-bold flex items-center justify-between transition-all ${isTotal ? "text-blue-100 group-hover:translate-x-1" : "text-blue-600 group-hover:text-blue-700"}`}>
                <span>{card.actionLabel}</span>
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Earners Component */}
      <TopEarners />

      {/* 5. Support CTA Banner */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-4 -mt-4" />
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">Official Help Desk</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Contact 24/7 Telegram support</p>
          </div>
        </div>
        <a
          href={config.support_link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center space-x-1.5 shrink-0 transition-all shadow-sm active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Support</span>
        </a>
      </div>
    </div>
  );
}
