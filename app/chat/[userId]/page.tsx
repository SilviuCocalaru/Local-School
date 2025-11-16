import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatRoom from "@/components/chat/ChatRoom";

export default async function ChatRoomPage({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <ChatRoom receiverId={params.userId} />;
}

