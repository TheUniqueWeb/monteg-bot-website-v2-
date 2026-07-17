import React, { useState, useEffect } from "react";
import { Shield, Info } from "lucide-react";
import { User, Ad, Task, TaskSubmission, Banner, AppConfig } from "./types";

import BottomNavbar from "./components/BottomNavbar";
import HomeView from "./components/HomeView";
import AdsView from "./components/AdsView";
import TasksView from "./components/TasksView";
import ReferView from "./components/ReferView";
import WithdrawView from "./components/WithdrawView";
import ProfileView from "./components/ProfileView";

import AdminLogin from "./components/AdminLogin";
import AdminView from "./components/AdminView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");

  // App core state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [completedAdIds, setCompletedAdIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);

  // Admin session & routing state
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem("monteg_admin_token")
  );
  const [isAdminPath, setIsAdminPath] = useState<boolean>(
    window.location.pathname === "/admin"
  );

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setIsAdminPath(path === "/admin");
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminPath(window.location.pathname === "/admin");
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // URL referral parameter detection
  const [urlReferrer, setUrlReferrer] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setUrlReferrer(ref);
      console.log("Referral Code Found from URL Query Parameters:", ref);
    }
  }, []);

  // Fetch configs, banners, and general ads/tasks
  const fetchGlobalData = async () => {
    try {
      const [configRes, bannerRes, adsRes, tasksRes] = await Promise.all([
        fetch("/api/config"),
        fetch("/api/banners"),
        fetch("/api/ads"),
        fetch("/api/tasks")
      ]);

      if (configRes.ok) setConfig(await configRes.json());
      if (bannerRes.ok) setBanners(await bannerRes.json());
      if (adsRes.ok) setAds(await adsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
    } catch (err) {
      console.error("Failed to load global server resources:", err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  // Sync user profile statistics
  const fetchUserProfileStats = async (userId: string) => {
    if (!userId) return;
    try {
      const [uRes, completedAdsRes, subsRes, wdRes] = await Promise.all([
        fetch(`/api/user/${userId}`),
        fetch(`/api/user/${userId}/completed-ads`),
        fetch(`/api/user/${userId}/submissions`),
        fetch(`/api/user/${userId}/withdrawals`)
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setCurrentUser(uData);
      } else if (uRes.status === 404) {
        localStorage.removeItem("monteg_user_id");
        setCurrentUser(null);
      }
      if (completedAdsRes.ok) setCompletedAdIds(await completedAdsRes.json());
      if (subsRes.ok) setSubmissions(await subsRes.json());
      if (wdRes.ok) setWithdrawals(await wdRes.json());
    } catch (err) {
      console.error("Failed to sync profile data:", err);
    }
  };

  // Auto-detect Telegram WebApp User or local cached session or fallback to default
  useEffect(() => {
    const handleInitAuth = async () => {
      // 1. Check if Telegram WebApp SDK is available and holds user info
      const tg = (window as any).Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;

      let telegramIdStr = "";
      let name = "";
      let username = "";
      let photo = "";

      if (tgUser && tgUser.id) {
        telegramIdStr = tgUser.id.toString();
        name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ");
        username = tgUser.username || "";
        photo = tgUser.photo_url || "";
        console.log("Detected Telegram WebApp user ID:", telegramIdStr);
      } else {
        // Fallback to Local Storage user ID if no Telegram SDK user is detected
        const savedUserId = localStorage.getItem("monteg_user_id");
        if (savedUserId) {
          console.log("Found cached local session for User ID:", savedUserId);
          fetchUserProfileStats(savedUserId);
          return;
        } else {
          // If neither, automatically register/load the standard default/owner account
          // to make it completely automated without requiring any user input!
          telegramIdStr = "683921"; // Default User ID
          name = "Telegram User";
          username = "telegram_user";
          photo = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
          console.log("No Telegram WebApp SDK or cached session. Auto-initializing fallback ID:", telegramIdStr);
        }
      }

      try {
        const body: any = {
          id: telegramIdStr,
          full_name: name,
          username: username,
          profile_photo_url: photo
        };

        if (urlReferrer && urlReferrer !== telegramIdStr) {
          body.refer_by = urlReferrer;
        }

        const initRes = await fetch("/api/user/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (initRes.ok) {
          const userData = await initRes.json();
          localStorage.setItem("monteg_user_id", userData.id);
          setCurrentUser(userData);
          fetchUserProfileStats(userData.id);
        } else {
          console.error("Auto registration/fetch failed");
        }
      } catch (err) {
        console.error("Auto Telegram WebApp connection failed:", err);
      }
    };

    if (config) {
      handleInitAuth();
    }
  }, [config, urlReferrer]);

  const handleAdminLogin = (token: string) => {
    localStorage.setItem("monteg_admin_token", token);
    setAdminToken(token);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("monteg_admin_token");
    setAdminToken(null);
    navigateTo("/admin");
  };

  const handleTriggerActionUpdate = () => {
    if (currentUser) {
      fetchUserProfileStats(currentUser.id);
    }
    fetchGlobalData();
  };

  if (isAdminPath) {
    return (
      <div id="admin-layout" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-blue-200">
        {/* Admin Header */}
        <header className="bg-slate-900 text-white shadow-xs shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo("/")}>
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center border border-blue-500 shadow-xs">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-wider text-white leading-tight">Monteg Bot</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Administrative Core</p>
              </div>
            </div>
            
            {adminToken && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-mono text-slate-400">Authenticated Staff</span>
                <button
                  onClick={handleAdminLogout}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Admin Content Area */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
          {config ? (
            adminToken ? (
              <AdminView
                currentConfig={config}
                onConfigChanged={setConfig}
                onActionTriggered={handleTriggerActionUpdate}
              />
            ) : (
              <AdminLogin onLoginSuccess={handleAdminLogin} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-bold">Connecting Admin Control Panel...</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans selection:bg-blue-200">
      
      {/* MAIN APPLICATION WORKSPACE container */}
      <main className="flex-grow w-full max-w-md mx-auto bg-slate-50/50 min-h-screen shadow-2xl pb-24 flex flex-col relative border-x border-slate-200/40">
        
        {/* Active Tab Banner Title */}
        <div className="bg-white border-b border-slate-100 px-4.5 py-3.5 flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
          <div className="space-y-0.5 relative z-10">
            <h2 className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
              {activeTab === "home" && "Dashboard Core"}
              {activeTab === "ads" && "Monetag Placements"}
              {activeTab === "tasks" && "Active Tasks"}
              {activeTab === "refer" && "Commission Program"}
              {activeTab === "withdraw" && "Withdraw Funds"}
              {activeTab === "profile" && "Verified Account"}
            </h2>
            {currentUser && (
              <p className="text-[10px] font-bold text-slate-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                <span>Secure Session ID: {currentUser.id}</span>
              </p>
            )}
          </div>
          {currentUser && (
            <button
              onClick={() => setActiveTab("profile")}
              className="relative z-10 transition-transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
            >
              <img
                src={currentUser.profile_photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                alt="Profile Settings"
                className={`w-8.5 h-8.5 rounded-full object-cover ring-2 transition-all ${
                  activeTab === "profile" ? "ring-blue-500 scale-105" : "ring-slate-150"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                }}
              />
            </button>
          )}
        </div>

        {/* Dynamic content render depending on tab selection */}
        <div className="p-4 flex-grow overflow-y-auto">
          {config ? (
            currentUser ? (
              <>
                {activeTab === "home" && (
                  <HomeView
                    user={currentUser}
                    banners={banners}
                    config={config}
                    setActiveTab={setActiveTab}
                  />
                )}

              {activeTab === "ads" && (
                <AdsView
                  user={currentUser}
                  ads={ads}
                  completedAdIds={completedAdIds}
                  config={config}
                  onAdCompleted={(updatedUser, adId) => {
                    setCurrentUser(updatedUser);
                    setCompletedAdIds((prev) => [...prev, adId]);
                    fetchUserProfileStats(updatedUser.id);
                  }}
                />
              )}

              {activeTab === "tasks" && (
                <TasksView
                  user={currentUser}
                  tasks={tasks}
                  submissions={submissions}
                  onTaskSubmitted={(updatedUser, submission) => {
                    setCurrentUser(updatedUser);
                    setSubmissions((prev) => [submission, ...prev]);
                    fetchUserProfileStats(updatedUser.id);
                  }}
                />
              )}

              {activeTab === "refer" && (
                <ReferView
                  user={currentUser}
                  config={config}
                />
              )}

              {activeTab === "withdraw" && (
                <WithdrawView
                  user={currentUser}
                  config={config}
                  onWithdrawSubmitted={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    fetchUserProfileStats(updatedUser.id);
                  }}
                />
              )}

              {activeTab === "profile" && (
                <ProfileView
                  user={currentUser}
                  submissions={submissions}
                  withdrawals={withdrawals}
                  onUserUpdate={(updated) => {
                    setCurrentUser(updated);
                    fetchUserProfileStats(updated.id);
                  }}
                />
              )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-bold">Synchronizing Telegram User profile...</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-bold">Synchronizing Monteg App Database...</p>
            </div>
          )}
        </div>

        {/* Bottom Nav bar layout */}
        <BottomNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdminLoggedIn={!!adminToken}
        />
      </main>
    </div>
  );
}
