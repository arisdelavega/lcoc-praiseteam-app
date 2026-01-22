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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans relative">
      {/* Small logo in top-right corner */}
      <div className="absolute top-4 right-4">
        <img src="/logo.png" alt="Logo" className="w-15 h-15 object-contain" />
      </div>

      <div className="bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-md z-10">
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
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-[16px]"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-[16px]"
          />

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleLogin}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-semibold text-base"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition font-semibold text-base"
            >
              Signup
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mt-4 text-sm px-4 py-2 rounded ${
                message.type === "success"
                  ? "bg-green-700 text-green-200 border border-green-600"
                  : "bg-red-700 text-red-200 border border-red-600"
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
