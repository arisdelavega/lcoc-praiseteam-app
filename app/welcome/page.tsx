"use client";

import NavbarTopRight from "../../components/NavbarTopRight";
import { supabase } from "../../lib/supabaseClient";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login"); // redirect if not logged in
      }
    }
    checkSession();
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Top-left logo */}
      <div className="absolute top-4 left-4">
        <img
          src="/logo.png"
          alt="Church Logo"
          className="w-35 h-35 object-contain"
        />
      </div>

      {/* Top-right Navbar */}
      <NavbarTopRight />

      {/* Centered welcome text */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white drop-shadow-lg">
        LCOC Praise Team 
      </h1>

      {/* Display image from public/musicteam.png */}
      <img
        src="/musicteam.png"
        alt="Music Team"
        className="w-185 h-auto rounded-lg shadow-2xl"
      />
    </div>
  );
}
