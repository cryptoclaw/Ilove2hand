// pages/login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState<string|null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(form.email, form.password, form.remember);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const googleLogin = async () => {
    try {
      setLoadingGoogle(true);
      const r = await fetch(`/api/auth/google/url?remember=${form.remember ? 1 : 0}&redirect=${encodeURIComponent('/')}`);
      const js = await r.json();
      if (js?.url) {
        window.location.href = js.url;
      } else {
        setLoadingGoogle(false);
        setError('Cannot start Google login');
      }
    } catch (e: any) {
      setLoadingGoogle(false);
      setError(e?.message || 'Cannot start Google login');
    }
  };

  return (
    <Layout title="Login">
      <div className="flex h-screen">
        {/* ฝั่งฟอร์ม */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">
              Log in into your account
            </h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm mb-1">Email Address</label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    placeholder="alex@email.com"
                    value={form.email}
                    onChange={onChange}
                    required
                    className="w-full border rounded-full pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
                    <Mail size={20} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm mb-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={onChange}
                    required
                    className="w-full border rounded-full pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
                    <Lock size={20} />
                  </div>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                    className="h-4 w-4"
                  />
                  <span>Remember me?</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Log in button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
              >
                Log in Now
              </button>
            </form>

            {/* OR */}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-gray-500">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Google Login */}
            <button
              onClick={googleLogin}
              disabled={loadingGoogle}
              className="w-full border border-gray-300 bg-white py-2 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loadingGoogle ? 'Connecting to Google…' : 'Continue with Google'}
            </button>

            {/* Sign up */}
            <button
              onClick={() => router.push("/register")}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
            >
              Sign up Now
            </button>
          </div>
        </div>

        {/* ภาพประกอบ */}
        <div className="hidden md:block w-1/2 relative">
          <Image
            src="/images/image.png"
            alt="Login Illustration"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Layout>
  );
}
