"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  PlusCircle,
  Search,
  Heart,
  MessageSquare,
  Repeat,
  Bell,
  User,
  Shield,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Package,
  Sparkles,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-1.5">
                  Campus<span className="text-indigo-600">Connect</span>
                </span>
                <span className="text-[10px] block font-medium uppercase tracking-wider text-emerald-600 -mt-1">
                  Verified College Market
                </span>
              </div>
            </Link>

            {/* Main Links */}
            <div className="hidden md:flex items-center gap-0.5 text-xs lg:text-sm font-medium text-zinc-600">
              <Link href="/browse" className="px-2.5 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-zinc-50 transition-colors">
                Browse
              </Link>
              <Link
                href="/lost-and-found"
                className="px-2.5 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-zinc-50 transition-colors flex items-center gap-1 text-zinc-800"
              >
                <span>Lost &amp; Found</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full animate-pulse">
                  New
                </span>
              </Link>
              <Link
                href="/browse?type=DONATION"
                className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1 text-emerald-800"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-600" />
                <span>Free Corner (₹0)</span>
              </Link>
              <Link
                href="/browse?type=SKILL_EXCHANGE"
                className="px-2.5 py-1.5 rounded-lg hover:text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-1 text-purple-800"
              >
                <span>Skill Swap</span>
              </Link>
              <Link
                href="/ai-price-estimator"
                className="px-2.5 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 text-indigo-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Valuation</span>
              </Link>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, drafters, calculators..."
                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-full border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          </form>

          {/* Action Items & Profile */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/listings/create">
              <Button size="sm" className="gap-1.5 rounded-full font-semibold shadow-xs">
                <PlusCircle className="w-4 h-4" />
                Sell / Exchange
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {user.collegeName && (
                  <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[170px]" title={user.collegeName}>
                      {user.collegeName.split("(")[0].trim()}
                    </span>
                  </div>
                )}

                <Link
                  href="/favorites"
                  title="Favorites"
                  className="p-2 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors relative"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <Link
                  href="/conversations"
                  title="Messages"
                  className="p-2 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <Link
                  href="/notifications"
                  title="Notifications"
                  className="p-2 text-zinc-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-zinc-800 max-w-[120px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <p className="text-xs font-medium text-zinc-500">Signed in as</p>
                        <p className="text-sm font-semibold text-zinc-900 truncate">{user.email}</p>
                        {user.collegeName && (
                          <p className="text-[11px] font-medium text-emerald-700 truncate mt-0.5 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{user.collegeName}</span>
                          </p>
                        )}
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {user.role}
                        </span>
                      </div>

                      <Link href={`/profile/${user.id}`} className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        <User className="w-4 h-4 text-zinc-500" />
                        My Profile
                      </Link>
                      <Link href="/my-listings" className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        <Package className="w-4 h-4 text-zinc-500" />
                        My Listings
                      </Link>
                      <Link href="/exchange-requests" className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        <Repeat className="w-4 h-4 text-zinc-500" />
                        Exchange Requests
                      </Link>

                      {user.role === "MODERATOR" && (
                        <Link href="/moderator" className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 font-medium hover:bg-amber-50">
                          <Shield className="w-4 h-4 text-amber-600" />
                          Moderator Panel
                        </Link>
                      )}

                      {user.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm text-indigo-700 font-medium hover:bg-indigo-50">
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-zinc-100 mt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register with College ID
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search marketplace..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50"
            />
          </form>

          <div className="space-y-1 font-medium text-sm text-zinc-700">
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              Browse All Items
            </Link>
            <Link
              href="/lost-and-found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50 font-semibold text-zinc-900"
            >
              <span>🔍 Campus Lost &amp; Found</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                New
              </span>
            </Link>
            <Link
              href="/browse?type=DONATION"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-800 hover:bg-emerald-50 font-medium"
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Free Giveaways Corner (₹0)</span>
            </Link>
            <Link
              href="/browse?type=SKILL_EXCHANGE"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-purple-800 hover:bg-purple-50 font-medium"
            >
              💡 Skill &amp; Academic Barter
            </Link>
            <Link
              href="/ai-price-estimator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-700 hover:bg-indigo-50 font-medium"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Price Estimator &amp; Valuation</span>
            </Link>
            <Link
              href="/browse?type=EXCHANGE"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              Campus Exchanges
            </Link>
            <Link
              href="/listings/create"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-semibold"
            >
              + Post New Listing
            </Link>
          </div>

          {user ? (
            <div className="pt-3 border-t border-zinc-200 space-y-2 text-sm">
              <div className="px-3 py-1">
                <p className="font-semibold text-zinc-900">{user.fullName}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
                {user.collegeName && (
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{user.collegeName}</span>
                  </p>
                )}
              </div>
              <Link href={`/profile/${user.id}`} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 hover:bg-zinc-50">
                My Profile
              </Link>
              <Link href="/my-listings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 hover:bg-zinc-50">
                My Listings
              </Link>
              <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 hover:bg-zinc-50">
                Saved Favorites
              </Link>
              <Link href="/conversations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 hover:bg-zinc-50">
                Messages
              </Link>
              <Link href="/exchange-requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 hover:bg-zinc-50">
                Exchange Requests
              </Link>
              {user.role === "MODERATOR" && (
                <Link href="/moderator" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-amber-700 font-semibold">
                  Moderator Dashboard
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-indigo-700 font-semibold">
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-1.5 text-rose-600 font-medium"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-zinc-200 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">Register with College Email</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
