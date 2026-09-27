import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ModeratorClient } from "./ModeratorClient";

export const dynamic = "force-dynamic";

export default async function ModeratorDashboardPage() {
  const session = await getSession();

  if (!session || (session.role !== "MODERATOR" && session.role !== "ADMIN")) {
    redirect("/login");
  }

  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true, branch: true } },
        },
      },
      targetListing: {
        include: {
          images: { take: 1 },
          user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        },
      },
      targetUser: {
        select: {
          id: true,
          email: true,
          status: true,
          profile: { select: { fullName: true, enrollmentNumber: true } },
        },
      },
      moderationActions: {
        include: {
          moderator: {
            select: {
              profile: { select: { fullName: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Moderation Queue</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Review reported campus listings and student accounts to enforce marketplace standards
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
          Campus Moderator Access
        </span>
      </div>

      <ModeratorClient initialReports={reports} />
    </div>
  );
}
