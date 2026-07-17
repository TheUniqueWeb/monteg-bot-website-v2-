import React, { useState, useEffect } from "react";
import { User, Banner, AppConfig } from "../types";
import { Tv, ClipboardList, Users, Wallet, Headphones, ChevronLeft, ChevronRight, MessageCircle, Star, Sparkles } from "lucide-react";

interface HomeViewProps {
  user: User;
  banners: Banner[];
  config: AppConfig;
  setActiveTab: (tab: string) => void;
}

export default function HomeView({ user, banners, config, setActiveTab }: HomeViewProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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
