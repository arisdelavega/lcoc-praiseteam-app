"use client";

import { supabase } from "../../lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      router.push("/welcome");
    }
  }

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      router.push("/welcome");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900">
      {/* Collage Background */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
        <img src="/1.png" alt="bg1" className="w-full h-full object-cover opacity-50" />
        <img src="/2.png" alt="bg2" className="w-full h-full object-cover opacity-50" />
        <img src="/3.png" alt="bg3" className="w-full h-full object-cover opacity-50" />
        <img src="/4.png" alt="bg4" className="w-full h-full object-cover object-top opacity-50" />
      </div>

      {/* Login Form */}
      <div
        className="relative z-10 bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md text-white"
        style={{
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {/* Top Right Logo */}
        <div className="absolute top-4 right-4">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">
          🎵 LCOC Praise Team Login
        </h1>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleLogin}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Signup
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mt-4 text-sm px-4 py-2 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
