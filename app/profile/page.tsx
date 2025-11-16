"use client";


import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import UserProfile from "@/components/profile/UserProfile";
import TopNav from "@/components/layout/TopNav";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default async function ProfilePage() {
  const supabase = createClient();
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
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50">
          <ThemeToggle />
        </div>
        <UserProfile userId={user.id} isOwnProfile={true} />
      </div>
    </div>
  );
}

