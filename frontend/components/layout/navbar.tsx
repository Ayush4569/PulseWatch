"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, ShieldAlert, Radio, LogOut, User as UserIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/context/auth-context";
import { Button } from "../ui/button";
import { toast } from "sonner";


interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export function Navbar({ onOpenCreateModal }: NavbarProps) {
  const pathname = usePathname();
  const {user,logout} = useAuthContext()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Monitors", href: "/dashboard/monitors", icon: Radio },
    { label: "Incidents", href: "/dashboard/incidents", icon: ShieldAlert },
  ];
  const handleLogout = async()=> {
    await logout();
    router.replace("/");
    toast.success("Logged out")
  }
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <span>Pulse<span className="text-emerald-400">Watch</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-800 text-white font-semibold"
                      : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-neutral-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Static WebSocket status indicator */}
          <div
            className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
            title="Real-time WebSocket indicator"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 -ml-4" />
            <span>Live WebSocket</span>
          </div>

          {/* Quick Create Monitor Button */}
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 shadow-sm transition-all hover:bg-emerald-400 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Monitor</span>
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
            >
              <UserIcon className="h-4 w-4 text-emerald-400" />
              <span className="max-w-[120px] truncate">{user?.username}</span>
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-800 bg-neutral-900 p-1 shadow-xl text-xs z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-neutral-800">
                  <p className="font-semibold text-white truncate">{user?.username}</p>
                  <p className="text-neutral-400 text-[11px] truncate">{user?.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-red-400 hover:bg-red-950/30 transition text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
