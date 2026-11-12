"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ShieldAlert,
  Radio,
  LogOut,
  User as UserIcon,
  Plus,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useSocket } from "@/socket/socket-provider";
import { ThemeToggle } from "../ui/theme-toggle";
import { toast } from "sonner";

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export function Navbar({ onOpenCreateModal }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { status: socketStatus } = useSocket();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll and listen for Escape key when mobile sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Monitors", href: "/dashboard/monitors", icon: Radio },
    { label: "Incidents", href: "/dashboard/incidents", icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/");
    toast.success("Logged out successfully");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <span>
                Pulse<span className="text-emerald-500 dark:text-emerald-400">Watch</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-accent text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2.5">
            {/* Guest Mode Indicator Badge */}
            {user?.isGuest && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="h-3 w-3" />
                <span>Guest (1 Monitor)</span>
              </span>
            )}

            {/* Guest Sign Up CTA */}
            {user?.isGuest && (
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white dark:text-neutral-950 shadow-sm transition hover:bg-emerald-500 dark:hover:bg-emerald-400 active:scale-95"
              >
                <span>Sign Up Free</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            {/* WebSocket Status Indicator */}
            {socketStatus === "connected" && (
              <div
                className="hidden sm:flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                title="WebSocket Connected: Real-time updates active"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>Live</span>
              </div>
            )}

            {socketStatus === "connecting" && (
              <div
                className="hidden sm:flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                title="Connecting to WebSocket server..."
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Connecting...</span>
              </div>
            )}

            {socketStatus === "disconnected" && (
              <div
                className="hidden sm:flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium border bg-muted text-muted-foreground border-border"
                title="WebSocket Disconnected"
              >
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span>Offline</span>
              </div>
            )}

            {/* Desktop Theme Toggle Button */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Quick Create Monitor Button */}
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:bg-accent active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-500" />
                <span>New Monitor</span>
              </button>
            )}

            {/* Desktop User Profile Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
              >
                <UserIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span className="max-w-[100px] truncate">
                  {user?.username}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-xs z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-border/80">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground truncate">
                        {user?.username}
                      </p>
                      {user?.isGuest && (
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-[11px] truncate mt-0.5">
                      {user?.isGuest ? "Temporary guest mode" : user?.email}
                    </p>
                  </div>

                  {user?.isGuest && (
                    <div className="p-1 border-b border-border/80">
                      <Link
                        href="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center justify-between gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                      >
                        <span>Upgrade to Free Account</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition text-left mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Icon Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-accent transition active:scale-95 shadow-xs"
              aria-label="Open mobile navigation sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar & Backdrop Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Sidebar Panel */}
          <aside
            className="fixed inset-y-0 right-0 z-50 flex h-full w-80 max-w-[85vw] flex-col justify-between border-l border-border bg-card p-6 shadow-2xl transition-transform duration-300 animate-in slide-in-from-right"
            role="dialog"
            aria-modal="true"
          >
            {/* Top: Header & Nav Links */}
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    <Activity className="h-4 w-4 animate-pulse" />
                  </div>
                  <span>
                    Pulse<span className="text-emerald-500">Watch</span>
                  </span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Guest Notification in Mobile Sidebar */}
              {user?.isGuest && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Guest Mode (1 Monitor)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Create a permanent account to unlock unlimited monitors and keep this endpoint.
                  </p>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 py-1.5 text-xs font-bold text-white dark:text-neutral-950 transition hover:bg-emerald-500 dark:hover:bg-emerald-400 shadow-xs"
                  >
                    <span>Sign Up Free</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {/* Status Badge inside Sidebar */}
              <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border/60 p-3">
                <span className="text-xs text-muted-foreground font-medium">WebSocket Status</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      socketStatus === "connected"
                        ? "bg-emerald-500 animate-ping"
                        : socketStatus === "connecting"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      socketStatus === "connected"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : socketStatus === "connecting"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                    }
                  >
                    {socketStatus === "connected"
                      ? "Live Stream Active"
                      : socketStatus === "connecting"
                      ? "Connecting..."
                      : "Offline"}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Menu
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Action Button */}
              {onOpenCreateModal && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCreateModal();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-neutral-950 shadow-sm hover:bg-emerald-400 transition active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Monitor</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom: Profile & Theme Toggle & Logout */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground font-medium">Appearance</span>
                <ThemeToggle />
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {user?.username}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.isGuest ? "Temporary guest mode" : user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
