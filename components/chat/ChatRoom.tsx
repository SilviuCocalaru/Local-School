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
    let unsubscribeCleanup: (() => void) | undefined;
    
    const setupSubscription = async () => {
      await loadReceiver();
      await loadMessages();
      unsubscribeCleanup = await subscribeToMessages();
    };
    
    setupSubscription();
    
    return () => {
      if (unsubscribeCleanup) {
        unsubscribeCleanup();
      }
    };
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
      // Error handled silently
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
      <header className="glass-strong rounded-b-3xl p-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white"
          >
            <FiArrowLeft className="text-2xl" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/15 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white font-semibold">
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
            className="flex-1 px-4 py-3 bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-xl text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 backdrop-blur-sm"
          />
          <button
            type="submit"
            className="px-4 py-3 glass-strong rounded-xl text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/40 transition-all"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}

