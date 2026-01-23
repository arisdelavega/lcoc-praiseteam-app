"use client";

import { supabase } from "../../lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  // ✅ Upsert profile for any user
  async function upsertProfile(user: any) {
    if (!user) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
    });
  }

  // Login handler
  async function handleLogin() {
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setMessage({ type: "error", text: loginError.message });
      return;
    }

    // ✅ Always fetch current user after login
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setMessage({ type: "error", text: "Failed to retrieve user info" });
      return;
    }

    // Upsert profile
    await upsertProfile(userData.user);

    router.push("/welcome");
  }

  // Signup handler
  async function handleSignup() {
    const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      setMessage({ type: "error", text: signupError.message });
      return;
    }

    // Upsert profile for new user
    await upsertProfile(signupData.user);

    router.push("/welcome");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
        <img src="/1.png" alt="bg1" className="w-full h-full object-cover opacity-50" />
        <img src="/2.png" alt="bg2" className="w-full h-full object-cover opacity-50" />
        <img src="/3.png" alt="bg3" className="w-full h-full object-cover opacity-50" />
        <img src="/4.png" alt="bg4" className="w-full h-full object-cover opacity-50" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
      </div>

      <div className="relative z-10 bg-gray-900/95 backdrop-blur-md shadow-2xl rounded-xl p-8 w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">
          🎵 LCOC Praise Team Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setMessage(null); }}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 text-white"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setMessage(null); }}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 text-white"
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleLogin}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-base font-semibold"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition text-base font-semibold"
            >
              Signup
            </button>
          </div>

          {message && (
            <div className={`mt-4 text-sm px-4 py-2 rounded ${message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
