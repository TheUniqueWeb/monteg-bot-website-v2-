import React, { useState } from "react";
import { User, TaskSubmission, Withdrawal } from "../types";
import { User as UserIcon, Calendar, Phone, ShieldCheck, Mail, Edit, Check } from "lucide-react";

interface ProfileViewProps {
  user: User;
  submissions: TaskSubmission[];
  withdrawals: Withdrawal[];
  onUserUpdate: (updatedUser: User) => void;
}

export default function ProfileView({ user, submissions, withdrawals, onUserUpdate }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name);
  const [username, setUsername] = useState(user.username);
  const [mobile, setMobile] = useState(user.mobile);
  const [profilePhoto, setProfilePhoto] = useState(user.profile_photo_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stats = {
    totalSubmissions: submissions.length,
    approvedTasks: submissions.filter((s) => s.status === "approved").length,
    totalWithdrawals: withdrawals.length,
    payoutVolume: withdrawals
      .filter((w) => w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0),
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          updates: {
            full_name: fullName,
            username: username,
            mobile: mobile,
            profile_photo_url: profilePhoto,
          },
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        onUserUpdate(updated);
        setIsEditing(false);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage("Failed to save profile changes.");
      }
    } catch (err) {
      setMessage("Error communicating with server.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div id="profile-view-container" className="space-y-4 pb-6">
      {/* 1. Main Avatar Card */}
      <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs text-center relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-100"
          >
            {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Decorative backdrop */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-slate-50 border-b border-slate-100/60" />

        <div className="relative mt-6 space-y-3">
          <img
            src={user.profile_photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
            alt={user.full_name}
            className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-blue-500/10"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
            }}
          />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">{user.full_name}</h2>
            <p className="text-[10px] text-slate-400 font-mono">@{user.username || "no_username"}</p>
          </div>

          <div className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-100/60 text-[9px] font-bold px-2.5 py-0.5 rounded-full space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Member</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold p-3 rounded-lg text-center">
          {message}
        </div>
      )}

      {/* 2. Interactive Editing vs Static Display Profile Details */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Account Details</h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username (@)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+8801XXXXXXXX"
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Photo URL</label>
              <input
                type="url"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
                placeholder="Photo link URL"
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden divide-y divide-slate-100/55">
          <div className="p-3.5 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>Full Name</span>
            </span>
            <span className="font-bold text-slate-800">{user.full_name}</span>
          </div>

          <div className="p-3.5 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Username</span>
            </span>
            <span className="font-bold text-slate-800 font-mono">@{user.username || "not_set"}</span>
          </div>

          <div className="p-3.5 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Mobile Phone</span>
            </span>
            <span className="font-bold text-slate-800 font-mono">{user.mobile || "not_set"}</span>
          </div>

          <div className="p-3.5 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Member ID</span>
            </span>
            <span className="font-bold text-blue-600 font-mono">{user.id}</span>
          </div>

          <div className="p-3.5 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Join Date</span>
            </span>
            <span className="font-bold text-slate-700">{formatJoinDate(user.join_date)}</span>
          </div>
        </div>
      )}

      {/* 3. Account Performance metrics */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center space-y-0.5">
            <span className="text-lg font-black text-slate-800">{stats.approvedTasks}</span>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tasks Approved</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center space-y-0.5">
            <span className="text-lg font-black text-slate-800">৳{stats.payoutVolume.toFixed(2)}</span>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Payout Volume</p>
          </div>
        </div>
      </div>

    </div>
  );
}
