import React from "react";
import { Home, Tv, ClipboardList, Users, Wallet } from "lucide-react";

interface BottomNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
}

export default function BottomNavbar({ activeTab, setActiveTab, isAdminLoggedIn }: BottomNavbarProps) {
  const navItems = [
    { id: "ads", label: "Monteg", icon: Tv },
    { id: "tasks", label: "Tasks", icon: ClipboardList },
    { id: "home", label: "Home", icon: Home, isCenter: true },
    { id: "refer", label: "Refer", icon: Users },
    { id: "withdraw", label: "Payout", icon: Wallet },
  ];

  return (
    <nav className="absolute bottom-4 left-4 right-4 h-16 rounded-2xl border border-slate-200/60 flex items-center justify-around bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/80 z-40 transition-all duration-300">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isCenter) {
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center relative -translate-y-4 focus:outline-none group z-50 select-none cursor-pointer"
            >
              <div className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:scale-105 active:scale-95 border-3 border-white ${
                isActive
                  ? "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-blue-500/30"
                  : "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white shadow-slate-900/30"
              }`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <span className={`text-[8px] mt-0.5 font-black tracking-wider uppercase transition-all ${
                isActive ? "text-blue-600" : "text-slate-500 font-bold"
              }`}>
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 transition-all duration-250 relative rounded-xl cursor-pointer ${
              isActive
                ? "text-blue-600 scale-105"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            <div className={`p-1 rounded-lg transition-all duration-300 ${isActive ? "bg-blue-50 text-blue-600" : ""}`}>
              <Icon className="w-5 h-5 transition-transform duration-300" />
            </div>
            <span className={`text-[8px] mt-0.5 tracking-tight font-black transition-all ${isActive ? "text-blue-600" : "text-slate-400 font-bold"}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
