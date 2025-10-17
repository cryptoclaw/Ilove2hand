"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/AuthCard";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [form.password]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "กรุณากรอกชื่อผู้ใช้";
    if (!emailRegex.test(form.email.trim())) e.email = "อีเมลไม่ถูกต้อง";
    if (form.password.length < 8) e.password = "อย่างน้อย 8 ตัวอักษร";
    if (form.confirm !== form.password) e.confirm = "รหัสผ่านไม่ตรงกัน";
    if (!form.agree) e.agree = "กรุณายอมรับเงื่อนไขการใช้งาน";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: "สมัครไม่สำเร็จ" }));
        throw new Error(error || "สมัครไม่สำเร็จ");
      }
      router.push("/login");
    } catch (err: any) {
      const msg = String(err?.message || "");
      setAuthError(
        msg.includes("unique") || msg.toLowerCase().includes("already")
          ? "อีเมลนี้ถูกใช้งานแล้ว"
          : msg || "สมัครไม่สำเร็จ"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard imageSrc="/images/logo_2hand.png" imageAlt="I Love 2Hand">
      <div className="w-full">
        <h1 className="text-center text-2xl font-semibold">ลงทะเบียน</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
          {authError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {authError}
            </div>
          )}

          {/* name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              ชื่อผู้ใช้
            </label>
            <div className="relative">
              <input
                name="name"
                type="text"
                placeholder="QweryDesign"
                value={form.name}
                onChange={onChange}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-11 ${
                  errors.name
                    ? "border-rose-400 focus:ring-rose-100"
                    : "border-slate-300 focus:ring-indigo-100"
                } focus:outline-none focus:ring-4`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 mr-1.5 my-1.5 inline-flex items-center justify-center rounded-lg p-2 text-slate-500">
                <User className="h-5 w-5" />
              </span>
            </div>
            {errors.name && (
              <p className="mt-1.5 text-sm text-rose-600">{errors.name}</p>
            )}
          </div>

          {/* email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              อีเมล
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder="alex@email.com"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-11 ${
                  errors.email
                    ? "border-rose-400 focus:ring-rose-100"
                    : "border-slate-300 focus:ring-indigo-100"
                } focus:outline-none focus:ring-4`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 mr-1.5 my-1.5 inline-flex items-center justify-center rounded-lg p-2 text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-rose-600">{errors.email}</p>
            )}
          </div>

          {/* password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="อย่างน้อย 8 ตัว (แนะนำ Aa 0-9 และสัญลักษณ์)"
                value={form.password}
                onChange={onChange}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                autoComplete="new-password"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-11 hide-edge-reveal ${
                  errors.password
                    ? "border-rose-400 focus:ring-rose-100"
                    : "border-slate-300 focus:ring-indigo-100"
                } focus:outline-none focus:ring-4`}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 mr-1.5 my-1.5 inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPw ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {(pwFocused || form.password) && (
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={[
                    "h-full transition-all",
                    form.password.length === 0 && "w-0",
                    form.password.length > 0 && "w-1/4 bg-rose-400",
                    /[A-Z]/.test(form.password) &&
                      /[a-z]/.test(form.password) &&
                      /\d/.test(form.password) &&
                      "w-2/4 bg-amber-400",
                    /[^A-Za-z0-9]/.test(form.password) &&
                      "w-3/4 bg-emerald-400",
                    form.password.length >= 12 && "w-full bg-emerald-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </div>
            )}
            {errors.password && (
              <p className="mt-1.5 text-sm text-rose-600">{errors.password}</p>
            )}
          </div>

          {/* confirm */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <input
                name="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="พิมพ์รหัสอีกครั้ง"
                value={form.confirm}
                onChange={onChange}
                autoComplete="new-password"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-11 hide-edge-reveal ${
                  errors.confirm
                    ? "border-rose-400 focus:ring-rose-100"
                    : "border-slate-300 focus:ring-indigo-100"
                } focus:outline-none focus:ring-4`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-0 mr-1.5 my-1.5 inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label={
                  showConfirm ? "ซ่อนรหัสผ่านยืนยัน" : "แสดงรหัสผ่านยืนยัน"
                }
              >
                {showConfirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1.5 text-sm text-rose-600">{errors.confirm}</p>
            )}
          </div>

          {/* terms */}
          <div className="flex items-center gap-2">
            <input
              id="agree"
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={onChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
            />
            <label htmlFor="agree" className="text-sm text-slate-700">
              ฉันยอมรับ{" "}
              <button
                type="button"
                onClick={() => router.push("/terms")}
                className="text-indigo-600 hover:underline"
              >
                ข้อตกลงการใช้งาน
              </button>
            </label>
          </div>
          {errors.agree && (
            <p className="mt-1 -mb-2 text-sm text-rose-600">{errors.agree}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full rounded-xl px-4 py-2.5 font-medium text-white focus:ring-4 ${
              loading
                ? "bg-indigo-400 cursor-not-allowed focus:ring-indigo-100"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200"
            }`}
          >
            {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
          </button>

          <p className="text-center text-sm text-slate-600">
            มีบัญชีอยู่แล้ว?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-indigo-600 hover:underline"
            >
              เข้าสู่ระบบ
            </button>
          </p>
        </form>
      </div>
    </AuthCard>
  );
}
