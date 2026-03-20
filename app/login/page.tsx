"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await signIn(email, password);

    if (error) {
      alert("Login failed");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-sm">

        <h1 className="text-2xl mb-4 text-cyan-400">Admin Login</h1>

        <input placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 bg-gray-800" />

        <input type="password" placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 bg-gray-800" />

        <button onClick={handleLogin}
          className="w-full bg-cyan-400 text-black py-2 rounded">
          Login
        </button>

      </div>
    </div>
  );
}