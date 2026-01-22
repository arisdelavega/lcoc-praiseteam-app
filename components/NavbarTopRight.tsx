"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NavbarTopRight() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUsername(user.email.split("@")[0]); // strip domain
      }
    }

    fetchUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUsername(session.user.email.split("@")[0]);
      } else {
        setUsername("");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    router.replace("/login");
  }

  return (
    <div className="absolute top-4 right-6 flex items-center gap-4">
      {/* ✅ Home/Welcome link */}
      <button
        onClick={() => router.push("/welcome")}
        className="text-blue-600 hover:underline"
      >
        Home
      </button>

      <button
        onClick={() => router.push("/songs")}
        className="text-blue-600 hover:underline"
      >
        Songs
      </button>

      <button
        onClick={() => router.push("/setlists")}
        className="text-blue-600 hover:underline"
      >
        Setlists
      </button>

      {/* ✅ Username with white text + black outline */}
      {username && (
        <span className="font-semibold text-white text-outline">
          Welcome, {username}!
        </span>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
