import React, { useState, useEffect } from "react";
import { User, Task, TaskSubmission, Withdrawal, Banner, AppConfig } from "../types";
import {
  Shield, Settings, Users, Wallet, ClipboardList, CheckSquare, Bell, Plus, Trash, Edit, Check, X,
  Ban, ShieldCheck, AlertTriangle, ExternalLink, Image, FileText, Search, UserMinus
} from "lucide-react";

interface AdminViewProps {
  currentConfig: AppConfig;
  onConfigChanged: (config: AppConfig) => void;
  onActionTriggered: () => void; // Trigger root updates on change
}

type AdminTab = "settings" | "users" | "withdrawals" | "tasks" | "submissions";

export default function AdminView({ currentConfig, onConfigChanged, onActionTriggered }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("settings");
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Config Form State
  const [botToken, setBotToken] = useState(currentConfig.bot_token);
  const [montegLink, setMontegLink] = useState(currentConfig.monteg_link);
  const [perAdAmount, setPerAdAmount] = useState(String(currentConfig.per_ad_amount));
  const [referReward, setReferReward] = useState(String(currentConfig.refer_reward));
  const [adLimit, setAdLimit] = useState(String(currentConfig.ad_limit));
  const [minWithdraw, setMinWithdraw] = useState(String(currentConfig.min_withdraw));
  const [supportLink, setSupportLink] = useState(currentConfig.support_link);
  const [scrollingNotice, setScrollingNotice] = useState(currentConfig.scrolling_notice);

  // New Banner state
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [newBannerLink, setNewBannerLink] = useState("");
  const [newBannerTitle, setNewBannerTitle] = useState("");

  // New Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAmount, setTaskAmount] = useState("");
  const [taskLink, setTaskLink] = useState("");
  const [taskProofType, setTaskProofType] = useState<"text" | "image">("text");
  const [taskVerifyMethod, setTaskVerifyMethod] = useState<"auto" | "manual">("manual");
  const [taskLimit, setTaskLimit] = useState("1000");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // User list searching & details editing
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Modal reason popups
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [rejectionType, setRejectionType] = useState<"withdrawal" | "submission" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const showMsg = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchAllAdminData = async () => {
    try {
      setIsLoading(true);
      const [uRes, tRes, sRes, wRes, bRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/tasks"),
        fetch("/api/admin/submissions"),
        fetch("/api/admin/withdrawals"),
        fetch("/api/banners")
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (sRes.ok) setSubmissions(await sRes.json());
      if (wRes.ok) setWithdrawals(await wRes.json());
      if (bRes.ok) setBanners(await bRes.json());
    } catch (err) {
      console.error("Failed to fetch admin dashboard logs:", err);
      showMsg("Failed to retrieve system logs.", true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [activeTab]);

  // Update Configs
  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_token: botToken,
          monteg_link: montegLink,
          per_ad_amount: perAdAmount,
          refer_reward: referReward,
          ad_limit: adLimit,
          min_withdraw: minWithdraw,
          support_link: supportLink,
          scrolling_notice: scrollingNotice
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onConfigChanged(data.config);
        showMsg("Configurations saved successfully!");
        onActionTriggered();
      } else {
        showMsg("Failed to save configurations.", true);
      }
    } catch (err) {
      showMsg("Network error saving configurations.", true);
    }
  };

  // User updates
  const handleSaveUserBalances = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          updates: {
            full_name: editingUser.full_name,
            username: editingUser.username,
            mobile: editingUser.mobile,
            ad_balance: Number(editingUser.ad_balance),
            task_balance: Number(editingUser.task_balance),
            refer_balance: Number(editingUser.refer_balance),
            total_balance: Number(editingUser.total_balance),
            status: editingUser.status
          }
        })
      });
      if (res.ok) {
        setEditingUser(null);
        showMsg("User profile updated successfully!");
        fetchAllAdminData();
        onActionTriggered();
      } else {
        showMsg("Failed to update user parameters.", true);
      }
    } catch (err) {
      showMsg("Server error updating user balances.", true);
    }
  };

  const toggleUserBan = async (user: User) => {
    const newStatus = user.status === "active" ? "banned" : "active";
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          updates: { status: newStatus }
        })
      });
      if (res.ok) {
        showMsg(`User successfully ${newStatus === "banned" ? "banned" : "unbanned"}!`);
        fetchAllAdminData();
        onActionTriggered();
      }
    } catch (err) {
      showMsg("Error setting user status.", true);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user profile? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("User deleted successfully.");
        fetchAllAdminData();
        onActionTriggered();
      }
    } catch (err) {
      showMsg("Failed to delete user.", true);
    }
  };

  // Withdrawal updates
  const updateWithdrawalStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    try {
      const res = await fetch("/api/admin/withdrawals/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejection_reason: reason })
      });
      if (res.ok) {
        showMsg(`Withdrawal successfully ${status}!`);
        fetchAllAdminData();
        onActionTriggered();
        setRejectionTargetId(null);
        setRejectionType(null);
        setRejectionReason("");
      }
    } catch (err) {
      showMsg("Error updating withdrawal.", true);
    }
  };

  // Proof submissions updates
  const updateSubmissionStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    try {
      const res = await fetch("/api/admin/submissions/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejection_reason: reason })
      });
      if (res.ok) {
        showMsg(`Submission successfully marked as ${status}!`);
        fetchAllAdminData();
        onActionTriggered();
        setRejectionTargetId(null);
        setRejectionType(null);
        setRejectionReason("");
      }
    } catch (err) {
      showMsg("Error verifying task proof.", true);
    }
  };

  // Task creation and updates
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskBody = {
        title: taskTitle,
        description: taskDesc,
        amount: taskAmount,
        link: taskLink,
        proof_type: taskProofType,
        verify_method: taskVerifyMethod,
        limit_count: taskLimit
      };

      let res;
      if (editingTask) {
        res = await fetch(`/api/admin/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskBody)
        });
      } else {
        res = await fetch("/api/admin/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskBody)
        });
      }

      if (res.ok) {
        showMsg(`Task successfully ${editingTask ? "updated" : "added"}!`);
        setTaskTitle("");
        setTaskDesc("");
        setTaskAmount("");
        setTaskLink("");
        setTaskProofType("text");
        setTaskVerifyMethod("manual");
        setTaskLimit("1000");
        setEditingTask(null);
        fetchAllAdminData();
      }
    } catch (err) {
      showMsg("Failed to manage campaign task.", true);
    }
  };

  const handleEditTaskSelect = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description);
    setTaskAmount(String(task.amount));
    setTaskLink(task.link);
    setTaskProofType(task.proof_type);
    setTaskVerifyMethod(task.verify_method);
    setTaskLimit(String(task.limit_count));
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this campaign task?")) return;
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("Task deleted successfully.");
        fetchAllAdminData();
      }
    } catch (err) {
      showMsg("Failed to delete task.", true);
    }
  };

  // Banners
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerUrl.trim()) return;
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: newBannerUrl,
          link_url: newBannerLink,
          title: newBannerTitle
        })
      });
      if (res.ok) {
        showMsg("Banner added successfully!");
        setNewBannerUrl("");
        setNewBannerLink("");
        setNewBannerTitle("");
        fetchAllAdminData();
        onActionTriggered();
      }
    } catch (err) {
      showMsg("Error uploading banner url.", true);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("Banner removed.");
        fetchAllAdminData();
        onActionTriggered();
      }
    } catch (err) {
      showMsg("Error removing banner.", true);
    }
  };

  // Rejection submit
  const submitRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionTargetId || !rejectionType) return;

    if (rejectionType === "withdrawal") {
      updateWithdrawalStatus(rejectionTargetId, "rejected", rejectionReason);
    } else {
      updateSubmissionStatus(rejectionTargetId, "rejected", rejectionReason);
    }
  };

  const openRejectionModal = (id: string, type: "withdrawal" | "submission") => {
    setRejectionTargetId(id);
    setRejectionType(type);
    setRejectionReason("");
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.id.includes(userSearch)
  );

  return (
    <div id="admin-view-root" className="space-y-4 pb-12 text-slate-800">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between border border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">System Core</span>
          </div>
          <h2 className="text-base font-black tracking-tight">Monteg Staff Dashboard</h2>
          <p className="text-[10px] text-slate-400">Total verified user base: {users.length} accounts</p>
        </div>
        <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-[10px] font-mono text-blue-400 font-bold shrink-0">
          v1.4.0
        </div>
      </div>

      {/* Message alert */}
      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-bold text-center border ${
            message.isError
              ? "bg-rose-50/55 border-rose-100 text-rose-800"
              : "bg-emerald-50/55 border-emerald-100 text-emerald-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 2. Admin Horizontal Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {[
          { id: "settings", label: "Global Settings", icon: Settings },
          { id: "users", label: "User Managers", icon: Users },
          { id: "withdrawals", label: "Withdrawals", icon: Wallet },
          { id: "tasks", label: "Social Campaigns", icon: ClipboardList },
          { id: "submissions", label: "Verification Desk", icon: CheckSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
                setEditingUser(null);
                setEditingTask(null);
              }}
              className={`flex items-center space-x-1 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                isActive ? "bg-blue-600 text-white shadow-xs" : "bg-white border border-slate-100 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === "submissions" && submissions.filter((s) => s.status === "pending").length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded ml-1">
                  {submissions.filter((s) => s.status === "pending").length}
                </span>
              )}
              {tab.id === "withdrawals" && withdrawals.filter((w) => w.status === "pending").length > 0 && (
                <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded ml-1">
                  {withdrawals.filter((w) => w.status === "pending").length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab contents */}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <form onSubmit={handleSaveConfigs} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Global Configurations</span>
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Telegram Bot Token</label>
                <input
                  type="text"
                  required
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400">Monetag Direct Link, Smartlink, or Ad Script Code</label>
                <textarea
                  required
                  rows={2}
                  value={montegLink}
                  onChange={(e) => setMontegLink(e.target.value)}
                  placeholder="Paste Monetag Direct Link URL, Smartlink, or <script>...</script> code here"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Reward Per Ad (৳)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={perAdAmount}
                  onChange={(e) => setPerAdAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Referral reward (৳)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={referReward}
                  onChange={(e) => setReferReward(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Daily Ads View Limit</label>
                <input
                  type="number"
                  required
                  value={adLimit}
                  onChange={(e) => setAdLimit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Minimum Withdraw (৳)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={minWithdraw}
                  onChange={(e) => setMinWithdraw(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Support Channel Link</label>
              <input
                type="url"
                required
                value={supportLink}
                onChange={(e) => setSupportLink(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Real-time Scrolling notice</label>
              <textarea
                required
                rows={2}
                value={scrollingNotice}
                onChange={(e) => setScrollingNotice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm"
            >
              Update Global Settings
            </button>
          </form>

          {/* Banner management area */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Promotional Banners List</span>
            </h3>

            <form onSubmit={handleAddBanner} className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
              <p className="font-bold text-slate-600">Add New Promoters Banner:</p>
              <div className="space-y-2">
                <input
                  type="url"
                  required
                  placeholder="Image URL (ImgBB / Unsplash)"
                  value={newBannerUrl}
                  onChange={(e) => setNewBannerUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Banner Title (Optional)"
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <input
                    type="url"
                    placeholder="Target Link (Optional)"
                    value={newBannerLink}
                    onChange={(e) => setNewBannerLink(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-[11px] flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Banner</span>
              </button>
            </form>

            <div className="grid grid-cols-2 gap-3">
              {banners.map((b) => (
                <div key={b.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative group">
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-full transition-all"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                  <img src={b.image_url} alt={b.title || ""} className="w-full h-24 object-cover rounded-lg" />
                  <p className="text-[10px] font-bold text-slate-700 mt-1.5 truncate">{b.title || "No Title"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by Name, Telegram ID, or Username..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-hidden"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="py-2.5">User Profile</th>
                    <th className="py-2.5 text-center">Balances</th>
                    <th className="py-2.5 text-center">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/40">
                      <td className="py-3">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={u.profile_photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{u.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              @{u.username || "no_username"} • ID:{u.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-black text-blue-600 font-mono block">৳{u.total_balance.toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Ads: ৳{u.ad_balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-100"
                            title="Edit Balances"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleUserBan(u)}
                            className={`p-1.5 rounded-lg border ${
                              u.status === "active"
                                ? "hover:bg-rose-50 text-rose-600 border-rose-100"
                                : "hover:bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}
                            title={u.status === "active" ? "Ban Account" : "Unban Account"}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-red-100"
                            title="Delete Profile"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Balance Editing Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleSaveUserBalances}
                className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative"
              >
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-sm font-bold text-slate-800">Edit Balances & Details: {editingUser.full_name}</h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Ad Balance (৳)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editingUser.ad_balance}
                        onChange={(e) => setEditingUser({ ...editingUser, ad_balance: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Task Balance (৳)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editingUser.task_balance}
                        onChange={(e) => setEditingUser({ ...editingUser, task_balance: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Refer Balance (৳)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editingUser.refer_balance}
                        onChange={(e) => setEditingUser({ ...editingUser, refer_balance: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Total Balance (৳)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editingUser.total_balance}
                        onChange={(e) => setEditingUser({ ...editingUser, total_balance: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab: Withdrawals */}
      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Withdrawal Audits</h3>

            {withdrawals.filter((w) => w.status === "pending").length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No pending withdrawal requests found.</p>
            ) : (
              <div className="space-y-3">
                {withdrawals
                  .filter((w) => w.status === "pending")
                  .map((wd) => (
                    <div key={wd.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-slate-800">User: {wd.user_name || wd.user_id}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {wd.user_id}</p>
                          <p className="text-xs font-bold text-slate-700 mt-2">
                            Gateway: <span className="text-blue-600 font-mono">{wd.payment_method}</span> ({wd.number})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 block">৳{wd.amount.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            {new Date(wd.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => updateWithdrawalStatus(wd.id, "approved")}
                          className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Payout</span>
                        </button>
                        <button
                          onClick={() => openRejectionModal(wd.id, "withdrawal")}
                          className="w-1/2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1 border border-red-100"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject Request</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Processed Withdrawal Logs</h3>
            <div className="space-y-3.5 divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
              {withdrawals
                .filter((w) => w.status !== "pending")
                .map((wd) => (
                  <div key={wd.id} className="pt-3.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-700">User: {wd.user_name || wd.user_id}</p>
                      <p className="text-[10px] text-slate-400">
                        {wd.payment_method} - {wd.number} • {new Date(wd.submitted_at).toLocaleDateString()}
                      </p>
                      {wd.status === "rejected" && wd.rejection_reason && (
                        <p className="text-[9px] text-rose-700 font-medium mt-1">Reason: {wd.rejection_reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold block">৳{wd.amount.toFixed(2)}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block border ${
                          wd.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}
                      >
                        {wd.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <form onSubmit={handleSaveTask} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <Plus className="w-4 h-4 text-slate-400" />
              <span>{editingTask ? "Modify Campaign Task" : "Launch Social Campaign Task"}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subscribe to Partners Youtube Channel"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Campaign Description & Instructions</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe step-by-step what the user needs to do to verify."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Reward (৳)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.15"
                    value={taskAmount}
                    onChange={(e) => setTaskAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Global Limit</label>
                  <input
                    type="number"
                    required
                    placeholder="1000"
                    value={taskLimit}
                    onChange={(e) => setTaskLimit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Campaign Target URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://t.me/monteg_partnership"
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Verification Proof Type</label>
                  <select
                    value={taskProofType}
                    onChange={(e) => setTaskProofType(e.target.value as "text" | "image")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="text">Text (Username/Profile Link)</option>
                    <option value="image">Image (Screenshot Upload)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Verify Method</label>
                  <select
                    value={taskVerifyMethod}
                    onChange={(e) => setTaskVerifyMethod(e.target.value as "auto" | "manual")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="manual">Manual Review (Admin Desk)</option>
                    <option value="auto">Auto-Verify (Instant payout)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              {editingTask && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskTitle("");
                    setTaskDesc("");
                    setTaskAmount("");
                    setTaskLink("");
                  }}
                  className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`font-bold py-3 rounded-xl text-xs transition-all ${
                  editingTask ? "w-2/3 bg-indigo-600 text-white" : "w-full bg-blue-600 text-white"
                }`}
              >
                {editingTask ? "Update Task campaign" : "Deploy Task Campaign"}
              </button>
            </div>
          </form>

          {/* Active campaign listings */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Campaign Pools</h3>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{t.title}</span>
                      <span className="bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase">
                        {t.verify_method}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{t.link}</p>
                    <p className="text-[10px] text-slate-400">
                      Reward: <span className="font-bold text-emerald-600">৳{t.amount.toFixed(2)}</span> • Limit:{" "}
                      {t.completed_count}/{t.limit_count}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleEditTaskSelect(t)}
                      className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg"
                      title="Edit Campaign"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg"
                      title="Delete Campaign"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Submissions Verification Desk */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Proof Submissions</h3>

            {submissions.filter((s) => s.status === "pending").length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">All task verification submissions cleared!</p>
            ) : (
              <div className="space-y-4">
                {submissions
                  .filter((s) => s.status === "pending")
                  .map((sub) => {
                    const linkedTask = tasks.find((t) => t.id === sub.task_id);
                    return (
                      <div key={sub.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              {linkedTask?.proof_type === "image" ? "Screenshot Proof" : "Text Proof"}
                            </span>
                            <h4 className="font-bold text-xs text-slate-800 mt-1">
                              Task: {linkedTask?.title || "Campaign Task"}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              Applicant: <span className="font-bold text-slate-700">{sub.user_name || sub.user_id}</span> • ID:{sub.user_id}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-600">৳{linkedTask?.amount.toFixed(2)}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">
                              {new Date(sub.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Proof Data View */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 text-xs">
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1.5">
                            User Submitted Proof Detail:
                          </p>
                          {linkedTask?.proof_type === "image" ? (
                            <div className="space-y-2">
                              <a
                                href={sub.proof_data}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative max-h-[220px] overflow-hidden rounded-lg group border border-slate-100"
                              >
                                <img src={sub.proof_data} alt="Screenshot Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-all">
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  <span>View Fullscreen</span>
                                </div>
                              </a>
                            </div>
                          ) : (
                            <p className="font-mono text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100 select-all whitespace-pre-wrap">
                              {sub.proof_data}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2 pt-1">
                          <button
                            onClick={() => updateSubmissionStatus(sub.id, "approved")}
                            className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify & Pay</span>
                          </button>
                          <button
                            onClick={() => openRejectionModal(sub.id, "submission")}
                            className="w-1/2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1 border border-rose-100"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject Submission</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Processed Proof Submissions Desk</h3>
            <div className="space-y-3.5 divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
              {submissions
                .filter((s) => s.status !== "pending")
                .map((sub) => (
                  <div key={sub.id} className="pt-3.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-700">Applicant: {sub.user_name || sub.user_id}</p>
                      <p className="text-[10px] text-slate-400">
                        Task: {sub.task_title || "Social Task"} • Status: {sub.status}
                      </p>
                      {sub.status === "rejected" && sub.rejection_reason && (
                        <p className="text-[9px] text-rose-700 font-medium mt-1">Reason: {sub.rejection_reason}</p>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        sub.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL POPUP */}
      {rejectionTargetId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={submitRejection}
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-slate-800"
          >
            <h3 className="text-sm font-bold text-slate-900">Provide Rejection Reason</h3>
            <p className="text-xs text-slate-400">
              This explanation will be shared with the applicant in their records log.
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Screenshot uploaded is blurry or does not prove subscription."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setRejectionTargetId(null);
                  setRejectionType(null);
                }}
                className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
