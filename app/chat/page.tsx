import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatList from "@/components/chat/ChatList";
import TopNav from "@/components/layout/TopNav";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="max-w-2xl mx-auto pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
        <ChatList />
      </div>
    </div>
  );
}

