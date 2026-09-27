import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExchangeClient } from "./ExchangeClient";

export const dynamic = "force-dynamic";

export default async function ExchangeRequestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const exchanges = await db.exchangeRequest.findMany({
    where: {
      OR: [{ buyerId: session.id }, { sellerId: session.id }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      targetListing: {
        include: { images: { take: 1 } },
      },
      offeredListing: {
        include: { images: { take: 1 } },
      },
      buyer: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true, branch: true } },
        },
      },
      seller: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true, branch: true } },
        },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Campus Exchange Requests</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Peer-to-peer item barter proposals, trade negotiations, and swap status
        </p>
      </div>

      <ExchangeClient initialExchanges={exchanges} currentUserId={session.id} />
    </div>
  );
}
