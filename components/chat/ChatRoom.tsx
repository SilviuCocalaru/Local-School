"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import MessagesList from "./MessagesList";

interface ChatRoomProps {
  receiverId: string;
}

export default function ChatRoom({ receiverId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [receiver, setReceiver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadReceiver();
    loadMessages();
    subscribeToMessages();
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadReceiver = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", receiverId)
      .single();

    if (data) setReceiver(data);
  };

  const loadMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey(id, name, avatar_url),
          receiver:users!messages_receiver_id_fkey(id, name, avatar_url)
        `
        )
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("sender_id", receiverId)
          .eq("receiver_id", user.id)
          .eq("read", false);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const channel = supabase
      .channel(`chat:${receiverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id}))`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: messageText.trim(),
      })
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar_url),
        receiver:users!messages_receiver_id_fkey(id, name, avatar_url)
      `
      )
      .single();

    if (data && !error) {
      setMessages([...messages, data]);
      setMessageText("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-strong rounded-2xl p-8">
          <p className="text-white/70">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="glass-strong rounded-b-3xl p-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white"
          >
            <FiArrowLeft className="text-2xl" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
            {receiver?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-white">{receiver?.name}</p>
            <p className="text-xs text-white/60">{receiver?.school}</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessagesList messages={messages} />

      {/* Input */}
      <div className="glass-strong rounded-t-3xl p-4 sticky bottom-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}

