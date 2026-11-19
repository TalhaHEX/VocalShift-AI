"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { ArrowRight, Lock, User, Loader2 } from "lucide-react";

// Studio Monogram
const StudioBadge = () => (
  <svg
    className="w-4 h-4 text-indigo-400"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2.5" y="4" width="19" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 14.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 17V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 13.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.5 15.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      error("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      error("Password Mismatch", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register(username, password);
      success("Registration Complete", res.message || "Account created successfully! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      error("Registration Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm mb-4">
            <div className="w-5 h-5 rounded-md bg-[#140F35] flex items-center justify-center">
              <StudioBadge />
            </div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              CREATOR ONBOARDING
            </span>
            <span className="text-slate-900 font-bold">VocalShift</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Create Studio Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
            Create an account to manage and dub video projects
          </p>
        </div>

        {/* Luminous Auth Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-window p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. director_steve"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#140F35] hover:bg-[#221B52] disabled:opacity-50 text-white font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/15 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
