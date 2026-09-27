import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, HeartHandshake, Lock } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Campus<span className="text-indigo-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              The official, peer-to-peer student marketplace for engineering and college campuses. Verified students buying, selling, and exchanging textbooks, equipment, and electronics with full transparency.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> College Email Verified
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Lock className="w-4 h-4" /> Zero Hidden Commission
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <HeartHandshake className="w-4 h-4" /> Peer to Peer
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse?category=textbooks" className="hover:text-indigo-400 transition-colors">
                  Engineering Textbooks
                </Link>
              </li>
              <li>
                <Link href="/browse?category=electronics" className="hover:text-indigo-400 transition-colors">
                  Laptops & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/browse?category=engineering-tools" className="hover:text-indigo-400 transition-colors">
                  Drafters & Lab Tools
                </Link>
              </li>
              <li>
                <Link href="/browse?category=cycles-mobility" className="hover:text-indigo-400 transition-colors">
                  Campus Bicycles
                </Link>
              </li>
              <li>
                <Link href="/browse?type=EXCHANGE" className="hover:text-indigo-400 transition-colors">
                  Student Item Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Guidelines */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Safety & Council</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-zinc-400">Public Campus Handover Only</span>
              </li>
              <li>
                <span className="text-zinc-400">Inspect Before Paying</span>
              </li>
              <li>
                <Link href="/report" className="hover:text-rose-400 transition-colors">
                  Report Suspicious Listing
                </Link>
              </li>
              <li>
                <span className="text-zinc-500 text-xs">Major B.Tech CSE Capstone Project</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} CampusConnect Marketplace. Developed for Academic Major Project.</p>
          <p>Built with Next.js 15, PostgreSQL, Prisma, Tailwind CSS & Strict TypeScript.</p>
        </div>
      </div>
    </footer>
  );
};
