import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  Calendar,
  Package,
  AlertTriangle,
  Edit,
  Mail,
  Phone,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const session = await getSession();

  let student: any = null;
  try {
    student = await db.user.findUnique({
      where: { id },
      include: {
        collegeDomain: true,
        profile: true,
        listings: {
          where: { status: "AVAILABLE" },
          orderBy: { createdAt: "desc" },
          include: {
            category: true,
            images: { take: 1 },
            user: {
              select: {
                id: true,
                profile: { select: { fullName: true, branch: true } },
              },
            },
          },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!student) notFound();

  const isSelf = session?.id === student.id;

  return (
    <div className="space-y-10">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-r from-indigo-600 to-indigo-900" />

        <div className="relative pt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg shrink-0">
              <div className="w-full h-full rounded-xl bg-indigo-100 text-indigo-700 font-bold text-3xl flex items-center justify-center">
                {student.profile?.fullName?.charAt(0).toUpperCase() || "S"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-zinc-900">{student.profile?.fullName || "Campus Student"}</h1>
                {student.isEmailVerified && (
                  <Badge variant="success" className="text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs uppercase">
                  {student.role}
                </Badge>
              </div>

              <p className="text-sm font-medium text-zinc-600">
                {student.profile?.branch || "Engineering"} • Year {student.profile?.yearOfStudy || "N/A"}
              </p>

              <p className="text-xs text-emerald-700 flex items-center justify-center sm:justify-start gap-1 pt-1">
                <GraduationCap className="w-4 h-4" />
                {student.collegeDomain?.collegeName || "Verified College Campus"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-2">
            {isSelf ? (
              <Link href="/settings">
                <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
                  <Edit className="w-4 h-4" /> Edit Profile
                </Button>
              </Link>
            ) : (
              <Link href={`/report?type=USER&targetId=${student.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-rose-600 hover:bg-rose-50 gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Report Account
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Bio & Details */}
        <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-600">
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-zinc-400">About Student</h4>
            <p className="text-zinc-700 text-sm leading-relaxed">
              {student.profile?.bio || "No student bio added yet."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-zinc-400">Campus Verification</h4>
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-zinc-600">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Joined {formatDate(student.createdAt)}
              </p>
              {isSelf && (
                <>
                  <p className="flex items-center gap-1.5 text-zinc-600">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" /> {student.email}
                  </p>
                  {student.profile?.phone && (
                    <p className="flex items-center gap-1.5 text-zinc-600">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" /> {student.profile.phone}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Active Listings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {student.listings.length} {student.listings.length === 1 ? "item" : "items"} available from this student
            </p>
          </div>
        </div>

        {student.listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {student.listings.map((item: any) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                condition={item.condition}
                transactionType={item.transactionType}
                createdAt={item.createdAt}
                imageUrl={item.images[0]?.url}
                categoryName={item.category.name}
                sellerName={student.profile?.fullName}
                sellerBranch={student.profile?.branch || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-sm">
            No active listings available from this student right now.
          </div>
        )}
      </section>
    </div>
  );
}
