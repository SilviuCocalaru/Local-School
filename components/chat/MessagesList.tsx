"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface MessagesListProps {
  messages: Message[];
}

export default function MessagesList({ messages }: MessagesListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] glass rounded-2xl p-3 ${
                isOwn
                  ? "bg-white/15 dark:bg-black/40"
                  : "bg-white/10 dark:bg-black/30"
              }`}
            >
              {!isOwn && (
                <p className="text-xs font-semibold text-black/80 dark:text-white/80 mb-1">
                  {message.sender?.name}
                </p>
              )}
              <p className="text-black dark:text-white text-sm">{message.content}</p>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}