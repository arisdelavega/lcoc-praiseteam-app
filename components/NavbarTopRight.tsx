"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NavbarTopRight() {
  const router = useRouter();

  useEffect(() => {
    // Listen for auth changes to automatically redirect if needed
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // no username logic needed
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

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
