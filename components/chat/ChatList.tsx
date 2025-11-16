"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FiSearch } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

interface ChatPreview {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    read: boolean;
  };
  unreadCount: number;
}

export default function ChatList() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadChats();
    subscribeToMessages();
  }, []);

  const loadChats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all accepted friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select(
          `
          friend_id,
          friend:users!friendships_friend_id_fkey(id, name, avatar_url)
        `
        )
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (!friendships) return;

      // Get last message for each friend
      const chatPreviews = await Promise.all(
        friendships.map(async (friendship: any) => {
          const { data: messages } = await supabase
            .from("messages")
            .select("*")
            .or(
              `and(sender_id.eq.${user.id},receiver_id.eq.${friendship.friend_id}),and(sender_id.eq.${friendship.friend_id},receiver_id.eq.${user.id})`
            )
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", friendship.friend_id)
            .eq("receiver_id", user.id)
            .eq("read", false);

          return {
            id: friendship.friend_id,
            user: friendship.friend,
            lastMessage: messages || undefined,
            unreadCount: count || 0,
          };
        })
      );

      setChats(chatPreviews);
    } catch (error) {
      console.error("Error loading chats:", error);
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
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <p className="text-white/70 text-lg mb-2">No messages yet</p>
          <p className="text-white/50 text-sm">
            Start chatting with your friends!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3 p-2 sm:p-4">
      {/* Search Bar */}
      <div className="rounded-[20px] sm:rounded-2xl p-3 mb-4 bg-white/5 backdrop-blur-[80px] saturate-[200%] border border-white/15">
        <div className="flex items-center gap-2 sm:gap-3">
          <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Chat List */}
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => router.push(`/chat/${chat.id}`)}
          className="w-full rounded-[20px] sm:rounded-2xl p-3 sm:p-4 bg-white/5 backdrop-blur-[100px] saturate-[200%] brightness-[1.1] border border-white/20 hover:bg-white/10 transition-all text-left touch-target"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent">
              {chat.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-xs sm:text-sm text-white truncate">
                  {chat.user.name}
                </p>
                {chat.lastMessage && (
                  <p className="text-[10px] sm:text-xs text-white/50 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(chat.lastMessage.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-white/70 truncate">
                  {chat.lastMessage?.content || "No messages yet"}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-[10px] sm:text-xs font-semibold rounded-full px-2 py-0.5 sm:py-1 flex-shrink-0 ml-2">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

