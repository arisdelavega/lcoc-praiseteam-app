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
          className="w-15 h-15 object-contain"
        />
      </div>

      {/* Top-right Navbar */}
      <NavbarTopRight />

      {/* Centered welcome text */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white drop-shadow-lg">
        Welcome to the Lambac Praise Team 🎶
      </h1>

      {/* Display image from public/musicteam.png */}
      <img
        src="/musicteam.png"
        alt="Music Team"
        className="w-185 h-auto rounded-lg shadow-2xl mb-6"
      />

      {/* Additional Info Section */}
      <div className="bg-black bg-opacity-60 text-white p-6 rounded-lg shadow-lg text-center space-y-2 max-w-md">
        <p className="text-lg font-semibold">Official Facebook Page:</p>
        <a
          href="https://www.facebook.com/CocLambac"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Coc Lambac
        </a>

        <p className="text-lg font-semibold mt-2">Email:</p>
        <a
          href="mailto:coclambac1908@gmail.com"
          className="text-blue-400 hover:underline"
        >
          coclambac1908@gmail.com
        </a>

        <p className="text-sm mt-4 text-gray-300">
          This is the original website of Lambac <br />
          Creator: TechTeam
        </p>
      </div>

      {/* Footer Welcome Note */}
      <p className="absolute bottom-4 text-white text-sm text-center w-full drop-shadow-lg">
        🎵 Welcome to the official page of Lambac Praise Team 🎵
      </p>
    </div>
  );
}
