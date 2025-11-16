
"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/profile/UserProfile";
import TopNav from "@/components/layout/TopNav";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(user.id);
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-white">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="max-w-2xl mx-auto pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-40">
          <ThemeToggle />
        </div>
        {userId && <UserProfile userId={userId} isOwnProfile={true} />}
      </div>
    </div>
  );
}

