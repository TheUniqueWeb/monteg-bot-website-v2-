import React, { useState } from "react";
import { Lock, Mail, AlertCircle, Shield } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || "Incorrect Admin Email or Password.");
      }
    } catch (err) {
      setError("Network error. Make sure the server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-login-wrapper" className="max-w-sm mx-auto my-12 bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-5">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-base font-black text-slate-800 tracking-tight">Admin Authentication</h2>
        <p className="text-[10px] text-slate-400">Secure entry point for Monteg Bot Staff</p>
      </div>

      {error && (
        <div className="bg-rose-50/50 border border-rose-100 p-3 text-rose-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Staff Email Address</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@monteg.com"
            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Security Password</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors text-xs flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Authenticate Securely</span>
          )}
        </button>
      </form>

      {/* Helper credentials box */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 leading-normal">
        <p className="font-bold text-slate-700 mb-1">Developer Credentials (Env Fallback):</p>
        <p>Email: <span className="font-mono text-slate-800">admin@monteg.com</span></p>
        <p>Password: <span className="font-mono text-slate-800">admin123</span></p>
      </div>
    </div>
  );
}
