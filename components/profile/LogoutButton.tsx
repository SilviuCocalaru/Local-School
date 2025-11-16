"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="glass-strong rounded-xl px-4 py-2 text-red-300 hover:text-red-200 hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2 pointer-events-auto"
      aria-label="Logout"
    >
      <FiLogOut />
      <span>Logout</span>
    </button>
  );
}

