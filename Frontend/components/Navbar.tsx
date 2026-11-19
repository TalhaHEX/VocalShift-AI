"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";

// Bespoke Studio Audio-Visual Monogram
const StudioLogoIcon = () => (
  <svg
    className="w-4 h-4 text-indigo-300"
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

// Minimalist Studio Clapperboard Icon
const StudioConsoleIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-indigo-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z" />
    <path d="m4 11 3-7h4l-3 7" />
    <path d="m11 4 3 7" />
    <path d="m15 4 3 7" />
  </svg>
);

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
        await fetch(`${apiUrl}/docs`, { method: "HEAD", mode: "no-cors" });
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 15000);
    return () => clearInterval(interval);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Section */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform hover:scale-[1.01]"
          >
            {/* Clean Monogram Brand Mark */}
            <div className="w-8 h-8 rounded-lg bg-[#140F35] flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
              <StudioLogoIcon />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base tracking-tight text-slate-900">
                VocalShift<span className="text-indigo-600"> Studio</span>
              </span>
            </div>
          </Link>

          {/* Navigation Pill */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              <StudioConsoleIcon />
              <span>Multi-Lingual Dubbing Console</span>
            </div>
          )}
        </div>

        {/* Right Section: Cloud Status & Auth */}
        <div className="flex items-center gap-3">
          {/* Cloud Processing Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-600 shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${apiOnline === true
                  ? "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                  : apiOnline === false
                    ? "bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                    : "bg-amber-400 animate-pulse"
                }`}
            />
            <span className="font-semibold text-slate-800">Studio Engine</span>
            <span className="text-slate-400 text-[10px]">
              {apiOnline === true ? "Online" : apiOnline === false ? "Offline" : "Connecting"}
            </span>
          </div>

          {/* User Auth Info */}
          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs shadow-sm">
                <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                  {user ? user.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="font-semibold text-slate-700">{user || "Creator"}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#140F35] hover:bg-[#221B52] text-white transition-all shadow-md shadow-indigo-950/10"
                >
                  Get Started
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};
