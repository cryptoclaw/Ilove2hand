// pages/admin/login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      setWelcome(true); // แสดงข้อความต้อนรับ
      // รอ 1.5 วินาที ก่อน redirect
      setTimeout(() => {
        router.push("/admin/home-manage");
      }, 1500);
    } else {
      const err = await res.json();
      setError(err.error || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      {welcome ? (
        <p className="text-green-600 text-xl font-semibold">Welcome, Admin!</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
            disabled={loading}
          />
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "Login as Admin"}
          </button>
        </form>
      )}
    </div>
  );
}
