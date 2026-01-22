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
    <div className="min-h-screen flex items-center justify-center relative bg-gray-900 text-white">
      
      {/* Background collage */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
        <img src="/1.png" className="w-full h-full object-cover opacity-30" alt="1" />
        <img src="/2.png" className="w-full h-full object-cover opacity-30" alt="2" />
        <img src="/3.png" className="w-full h-full object-cover opacity-30" alt="3" />
        <img src="/4.png" className="w-full h-full object-cover opacity-30" alt="4" />
      </div>

      {/* Login form */}
      <div
        className="relative bg-gray-800 bg-opacity-90 shadow-xl rounded-xl p-8 w-full max-w-md z-10"
        style={{ WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}
      >
        {/* Logo top-right */}
        <div className="absolute top-4 right-4">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>

        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">
          🎵 LCOC Praise Team Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage(null);
            }}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMessage(null);
            }}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleLogin}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Signup
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 text-sm px-4 py-2 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
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
