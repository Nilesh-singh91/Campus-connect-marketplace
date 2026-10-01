"use client";

import React, { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Package,
  Repeat,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Layers,
  Search,
} from "lucide-react";
import { showToast } from "@/context/ToastContext";

interface AdminClientProps {
  metrics: {
    totalUsers: number;
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalExchanges: number;
    pendingReports: number;
  };
  initialUsers: any[];
  categories: any[];
}

export const AdminClient: React.FC<AdminClientProps> = ({
  metrics,
  initialUsers,
  categories,
}) => {
  const [users, setUsers] = useState(initialUsers);
  const [searchUser, setSearchUser] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = searchUser.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      u.profile?.fullName?.toLowerCase().includes(term) ||
      u.profile?.enrollmentNumber?.toLowerCase().includes(term)
    );
  });

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
        showToast(`User status updated to ${newStatus}`, "success");
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to update status", "error");
      }
    } catch {
      showToast("Network error updating user status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showToast(`User role updated to ${newRole}`, "success");
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to update role", "error");
      }
    } catch {
      showToast("Network error updating user role", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Students</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900">{metrics.totalUsers}</p>
          <p className="text-[11px] text-zinc-400">Verified campus registrations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Listings</span>
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900">{metrics.totalListings}</p>
          <p className="text-[11px] text-zinc-400">
            {metrics.activeListings} active • {metrics.soldListings} sold
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Exchanges</span>
            <Repeat className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900">{metrics.totalExchanges}</p>
          <p className="text-[11px] text-zinc-400">P2P trade barter proposals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reports</span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900">{metrics.pendingReports}</p>
          <p className="text-[11px] text-rose-500 font-medium">Awaiting moderation action</p>
        </div>
      </div>

      {/* Categories Distribution */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Category Catalog Breakdown</h2>
          <span className="text-xs text-zinc-500">{categories.length} total categories</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center space-y-1">
              <p className="text-xs font-semibold text-zinc-800 truncate">{c.name}</p>
              <p className="text-base font-bold text-indigo-600">{c._count.listings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Accounts Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Student & Staff Accounts</h2>
            <p className="text-xs text-zinc-500">Manage privileges, suspensions, and campus verification</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search by name, roll no, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-y border-zinc-200 text-zinc-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">College Email</th>
                <th className="py-3 px-4">Enrollment / Branch</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50">
                  <td className="py-3 px-4 font-semibold text-zinc-900">
                    {u.profile?.fullName || "Student"}
                  </td>
                  <td className="py-3 px-4 text-zinc-600">{u.email}</td>
                  <td className="py-3 px-4 text-zinc-500">
                    {u.profile?.enrollmentNumber || "N/A"} • {u.profile?.branch || "General"}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                      className="px-2 py-1 rounded border border-zinc-200 bg-white font-medium text-xs cursor-pointer"
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : u.status === "SUSPENDED"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.status === "ACTIVE" ? (
                        <button
                          disabled={updatingId === u.id}
                          onClick={() => handleStatusUpdate(u.id, "SUSPENDED")}
                          className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          disabled={updatingId === u.id}
                          onClick={() => handleStatusUpdate(u.id, "ACTIVE")}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold cursor-pointer"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
