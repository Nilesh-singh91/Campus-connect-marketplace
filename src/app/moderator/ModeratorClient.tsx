"use client";

import React, { useState } from "react";
import { formatDate, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
} from "lucide-react";
import { showToast } from "@/context/ToastContext";

interface ModeratorClientProps {
  initialReports: any[];
}

export const ModeratorClient: React.FC<ModeratorClientProps> = ({ initialReports }) => {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [actionType, setActionType] = useState("DISMISS_REPORT");
  const [internalNotes, setInternalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filteredReports =
    filterStatus === "ALL" ? reports : reports.filter((r) => r.status === filterStatus);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType,
          internalNotes,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === selectedReport.id ? json.data.report : r))
        );
        showToast("Moderation action executed successfully", "success");
        setSelectedReport(null);
        setInternalNotes("");
      } else {
        showToast(json.error || "Failed to execute moderation action", "error");
      }
    } catch {
      showToast("Network error updating report", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusVariants: Record<string, "warning" | "default" | "success" | "secondary"> = {
    PENDING: "warning",
    INVESTIGATING: "default",
    RESOLVED: "success",
    DISMISSED: "secondary",
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2">
        {["ALL", "PENDING", "RESOLVED", "DISMISSED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              filterStatus === status
                ? "bg-zinc-900 border-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {status} ({status === "ALL" ? reports.length : reports.filter((r) => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Reports Table */}
      {filteredReports.length > 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs divide-y divide-zinc-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-5 sm:p-6 space-y-4 hover:bg-zinc-50/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariants[report.status] || "secondary"}>
                    {report.status}
                  </Badge>
                  <span className="text-xs font-bold uppercase text-zinc-400">
                    {report.targetType} REPORT
                  </span>
                  <span className="text-xs text-zinc-400">• {timeAgo(report.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    Reported by: <strong className="text-zinc-800">{report.reporter.profile?.fullName}</strong>
                  </span>
                </div>
              </div>

              {/* Target Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reason</p>
                  <p className="text-sm font-semibold text-zinc-900">{report.reason}</p>
                  {report.details && (
                    <p className="text-xs text-zinc-600 italic mt-1">&ldquo;{report.details}&rdquo;</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Entity</p>
                  {report.targetListing && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-zinc-900 truncate">
                        {report.targetListing.title}
                      </span>
                      <Link
                        href={`/listings/${report.targetListing.id}`}
                        target="_blank"
                        className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                  {report.targetUser && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-zinc-900 truncate">
                        {report.targetUser.profile?.fullName} ({report.targetUser.email})
                      </span>
                      <Link
                        href={`/profile/${report.targetUser.id}`}
                        target="_blank"
                        className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Moderation Action Logs if already resolved */}
              {report.moderationActions?.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                  <p className="font-semibold text-amber-900">Resolved by Moderator:</p>
                  {report.moderationActions.map((act: any) => (
                    <p key={act.id} className="text-amber-800">
                      <strong>{act.actionType}</strong>: {act.internalNotes || "No notes"}
                    </p>
                  ))}
                </div>
              )}

              {/* Action Button */}
              {report.status === "PENDING" && (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedReport(report);
                      setActionType(
                        report.targetType === "LISTING" ? "REMOVE_LISTING" : "WARN_USER"
                      );
                    }}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    Take Moderation Action
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-semibold text-zinc-900 text-lg">No reports in this view</h3>
          <p className="text-sm text-zinc-500">The marketplace is compliant with student standards.</p>
        </div>
      )}

      {/* Moderation Action Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Resolve Moderation Report"
        description="Choose the disciplinary or corrective action to take on this campus entity"
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Enforcement Action
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
            >
              {selectedReport?.targetType === "LISTING" && (
                <option value="REMOVE_LISTING">Remove Listing (TOS Violation)</option>
              )}
              <option value="WARN_USER">Issue Formal Warning to Student</option>
              <option value="SUSPEND_USER">Suspend Student Account</option>
              <option value="BAN_USER">Ban Student Account Permanently</option>
              <option value="DISMISS_REPORT">Dismiss Report (No Violation Found)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Internal Moderation Note / Justification
            </label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Prohibited item verified with campus guidelines. Listing removed and seller notified."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button variant="ghost" type="button" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" isLoading={isSubmitting} className="font-semibold">
              Execute Action
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
