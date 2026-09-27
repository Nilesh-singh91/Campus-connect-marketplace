import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { timeAgo, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, ArrowRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const conversations = await db.conversation.findMany({
    where: {
      members: { some: { userId: session.id } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          images: { take: 1 },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, branch: true } },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Campus Messages</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Direct chats with students regarding item purchases, trade locations, and availability
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-xs">
          {conversations.map((conv) => {
            const otherMember = conv.members.find((m) => m.userId !== session.id);
            const otherUser = otherMember?.user;
            const lastMessage = conv.messages[0];

            return (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="p-5 flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shrink-0">
                    {otherUser?.profile?.fullName?.charAt(0).toUpperCase() || "S"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {otherUser?.profile?.fullName || "Student"}
                      </h3>
                      {otherUser?.profile?.branch && (
                        <span className="text-[11px] text-zinc-400">• {otherUser.profile.branch}</span>
                      )}
                    </div>

                    {conv.listing && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium mt-0.5">
                        <Package className="w-3.5 h-3.5" />
                        <span className="truncate">{conv.listing.title}</span>
                        <span>({formatPrice(conv.listing.price)})</span>
                      </div>
                    )}

                    <p className="text-xs text-zinc-500 truncate mt-1">
                      {lastMessage ? lastMessage.content : "Conversation initiated"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {lastMessage ? timeAgo(lastMessage.createdAt) : timeAgo(conv.updatedAt)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-2 ml-auto" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-4 max-w-md mx-auto">
          <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-semibold text-zinc-900 text-lg">No active messages</h3>
          <p className="text-sm text-zinc-500">
            When you contact a seller or a student messages you about your listing, the conversation will appear here.
          </p>
          <div className="pt-2">
            <Link href="/browse">
              <span className="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                Browse Marketplace
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
