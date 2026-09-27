"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Send, Package, UserCheck, ShieldAlert } from "lucide-react";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const json = await res.json();
        setConversation(json.data);
        setMessages(json.data.messages || []);
      } else if (res.status === 403) {
        setError("You are not authorized to access this conversation.");
      } else {
        setError("Failed to load conversation.");
      }
    } catch {
      setError("Network error loading conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      setIsSending(true);
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        const json = await res.json();
        setMessages((prev) => [...prev, json.data]);
      } else {
        const json = await res.json();
        alert(json.error || "Failed to send message");
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-zinc-500">Loading conversation...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-zinc-200">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Access Restricted</h2>
        <p className="text-sm text-zinc-500">{error}</p>
        <Link href="/conversations" className="inline-block pt-2">
          <Button variant="outline">Return to Messages</Button>
        </Link>
      </div>
    );
  }

  const otherMember = conversation?.members?.find((m: any) => m.userId !== user?.id);
  const otherUser = otherMember?.user;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between gap-4 bg-zinc-50/70">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/conversations" className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
            {otherUser?.profile?.fullName?.charAt(0).toUpperCase() || "S"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-zinc-900 text-sm truncate">
                {otherUser?.profile?.fullName || "Student"}
              </h2>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[11px] text-zinc-500 truncate">
              {otherUser?.profile?.branch || "Campus Student"}
            </p>
          </div>
        </div>

        {conversation?.listing && (
          <Link
            href={`/listings/${conversation.listing.id}`}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-zinc-200 hover:border-indigo-300 transition-colors max-w-xs truncate text-xs"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
              <img
                src={conversation.listing.images[0]?.url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate">
              <p className="font-semibold text-zinc-900 truncate">{conversation.listing.title}</p>
              <p className="text-indigo-600 font-bold">{formatPrice(conversation.listing.price)}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/40">
        <div className="text-center py-2">
          <span className="text-[11px] font-medium text-zinc-400 bg-white px-3 py-1 rounded-full border border-zinc-200 shadow-2xs">
            Direct Campus Peer Messaging • Public Safety Rules Apply
          </span>
        </div>

        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                    : "bg-white text-zinc-800 border border-zinc-200 rounded-bl-xs shadow-xs"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 px-1">
                {timeAgo(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-zinc-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message (e.g. Can we meet near the library?)..."
          className="flex-1 px-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-400"
        />
        <Button
          type="submit"
          size="md"
          isLoading={isSending}
          disabled={!newMessage.trim()}
          className="rounded-xl px-4 py-2 font-semibold gap-1.5 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}
