import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PackageOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
        <PackageOpen className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Page Not Found</h1>
        <p className="text-sm text-zinc-500">
          The listing, conversation, or page you were looking for doesn&apos;t exist or was removed.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Home
          </Button>
        </Link>
        <Link href="/browse">
          <Button size="sm" className="font-semibold">
            Browse Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}
