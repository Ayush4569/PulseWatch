"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, User, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [username, setUsername] = useState<string>("alex_developer");
  const [email, setEmail] = useState<string>("alex@example.com");
  const [password, setPassword] = useState<string>("password123");
  const [confirmPassword, setConfirmPassword] = useState<string>("password123");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Registration preview successful!", { description: "Redirecting to dashboard..." });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <span>Pulse<span className="text-emerald-400">Watch</span></span>
          </Link>
          <h2 className="text-xl font-bold text-white mt-4">Create your account</h2>
          <p className="mt-1 text-xs text-neutral-400">Start monitoring your endpoints in real time</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                required
                placeholder="devmaster"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-neutral-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/10"
          >
            <span>Create Account (Static UI)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
