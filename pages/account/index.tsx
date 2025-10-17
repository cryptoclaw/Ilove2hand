"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Image as ImageIcon, Pencil, Check, X } from "lucide-react";

/** ---------- Types (ฝั่ง UI) ---------- */
type Gender = "male" | "female" | "other";
type UserProfile = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  avatarUrl?: string | null;
};

// ค่าตั้งต้นแบบ mock เผื่อ user ยังว่าง/ไม่มีฟิลด์ใน schema
const mockUser: UserProfile = {
  username: "",
  fullName: "",
  email: "",
  phone: "",
  gender: "other",
  birthDate: "",
  avatarUrl: "",
};

export default function AccountPage() {
  const { user, loading } = useAuth(); // ✅ จาก Next AuthContext (login/logout/adminLogout)
  const fileRef = useRef<HTMLInputElement | null>(null);

  // รวมข้อมูลจาก auth.user -> ฟอร์ม UI
  const hydrateFromAuth = (base: UserProfile): UserProfile => ({
    ...base,
    // schema จริง: name, email, avatarUrl
    fullName: user?.name ?? base.fullName,
    email: user?.email ?? base.email,
    avatarUrl: user?.avatarUrl ?? base.avatarUrl,
    // ส่วนที่ schema ยังไม่มี — เก็บเฉพาะด้าน UI
    username: base.username || "",
    phone: base.phone || "",
    gender: base.gender || "other",
    birthDate: base.birthDate || "",
  });

  // data = ค่าที่ "บันทึกแล้ว"
  const [data, setData] = useState<UserProfile>(() =>
    hydrateFromAuth(mockUser)
  );
  // draft = ค่าที่กำลังแก้ไข
  const [draft, setDraft] = useState<UserProfile>(() =>
    hydrateFromAuth(mockUser)
  );

  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [preview, setPreview] = useState<string>(
    hydrateFromAuth(mockUser).avatarUrl || ""
  );

  // เมื่อ user เปลี่ยน (login/logout) → hydrate ใหม่
  useEffect(() => {
    const initial = hydrateFromAuth(mockUser);
    setData(initial);
    setDraft(initial);
    setPreview(initial.avatarUrl || "");
    setEditing(false);
    setDirty(false);
  }, [user]);

  const genders: { label: string; value: Gender }[] = useMemo(
    () => [
      { label: "ชาย", value: "male" },
      { label: "หญิง", value: "female" },
      { label: "อื่นๆ", value: "other" },
    ],
    []
  );

  const BTN_BASE =
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-100";
  const BTN_MD = "px-5 py-2";
  const BTN_SM = "px-3 py-1.5";
  const BTN_BLACK = `${BTN_BASE} bg-gray-900 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`;
  const BTN_OUTLINE_BLACK = `${BTN_BASE} border border-gray-900 text-gray-900 bg-white hover:bg-gray-900 hover:text-white`;
  const BTN_LIGHT = `${BTN_BASE} border border-gray-300 bg-white hover:bg-gray-50`;
  const BTN_RED = `${BTN_BASE} border border-red-500 text-red-600 hover:bg-red-50`;

  const onPick = () => {
    if (!editing) return;
    fileRef.current?.click();
  };

  const onFile = (f?: File) => {
    if (!editing || !f) return;
    if (!/(jpe?g|png)$/i.test(f.name)) return alert("รองรับเฉพาะ JPEG/PNG");
    if (f.size > 1_000_000) return alert("ไฟล์ต้องไม่เกิน 1MB");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      setPreview(base64);
      setDraft((p) => {
        const next = { ...p, avatarUrl: base64 };
        setDirty(!isEqual(next, data));
        return next;
      });
    };
    reader.readAsDataURL(f);
  };

  const onChange =
    (k: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editing) return;
      const value = e.target.value;
      setDraft((p) => {
        const next = { ...p, [k]: value };
        setDirty(!isEqual(next, data));
        return next;
      });
    };

  const startEdit = () => {
    setDraft(data);
    setPreview(data.avatarUrl || "");
    setEditing(true);
    setDirty(false);
  };
  const cancelEdit = () => {
    setDraft(data);
    setPreview(data.avatarUrl || "");
    setEditing(false);
    setDirty(false);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;

    // --- ถ้าจะบันทึกจริงกับ DB: call API ที่คุณทำไว้ (ดูตัวอย่างด้านล่าง) ---
    // try {
    //   const r = await fetch("/api/account/profile", {
    //     method: "PATCH",
    //     credentials: "include",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       name: draft.fullName,
    //       avatarUrl: draft.avatarUrl, // base64 หรือ URL ก็ได้แล้วแต่ฝั่ง server
    //     }),
    //   });
    //   if (!r.ok) throw new Error("Update failed");
    // } catch (err: any) {
    //   alert(err?.message || "ไม่สามารถบันทึกได้");
    //   return;
    // }

    // mock เซฟในหน้า
    setData(draft);
    setEditing(false);
    setDirty(false);
    alert("อัปเดตข้อมูลสำเร็จ (mock)");
  };

  const view = editing ? draft : data;

  // Loading ช่วงดึงโปรไฟล์จากคุกกี้
  if (loading) {
    return (
      <Layout title="บัญชีของฉัน">
        <div className="mx-auto max-w-3xl p-8">กำลังโหลด...</div>
      </Layout>
    );
  }

  // ยังไม่ได้ล็อกอิน
  if (!user) {
    return (
      <Layout title="บัญชีของฉัน">
        <div className="mx-auto max-w-3xl p-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <h1 className="text-lg font-semibold mb-2">โปรดเข้าสู่ระบบ</h1>
            <p className="text-gray-600">
              ต้องเข้าสู่ระบบก่อนจึงจะจัดการบัญชีได้
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="บัญชีของฉัน">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <AccountSidebar />

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg font-semibold">บัญชีของฉัน</h1>
            </div>

            <hr className="mb-6 border-gray-200" />

            <form onSubmit={saveEdit} className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                  {preview ? (
                    <img
                      src={preview}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-gray-400">
                      ไม่มีรูป
                    </div>
                  )}
                </div>

                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    hidden
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={onPick}
                    disabled={!editing}
                    className={`${BTN_LIGHT} ${BTN_SM} ${
                      !editing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    เลือกรูป
                  </button>
                  <div className="mt-1 text-xs text-gray-500">
                    ขนาดไฟล์สูงสุด 1 MB รองรับ: JPEG, PNG
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="ชื่อผู้ใช้">
                  <input
                    className={`w-full rounded-xl px-3 py-2 outline-none transition ${
                      editing
                        ? "border border-gray-400 hover:border-gray-500 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 bg-white"
                        : "border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    }`}
                    value={view.username}
                    onChange={onChange("username")}
                    placeholder="ชื่อผู้ใช้"
                    disabled={!editing}
                  />
                </Field>

                <Field label="ชื่อจริง">
                  <input
                    className={`w-full rounded-xl px-3 py-2 outline-none transition ${
                      editing
                        ? "border border-gray-400 hover:border-gray-500 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 bg-white"
                        : "border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    }`}
                    value={view.fullName}
                    onChange={onChange("fullName")}
                    placeholder="ชื่อ-นามสกุล"
                    disabled={!editing}
                  />
                </Field>

                <Field label="อีเมล" full>
                  <input
                    type="email"
                    className={`w-full rounded-xl px-3 py-2 outline-none transition ${
                      editing
                        ? "border border-gray-400 hover:border-gray-500 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 bg-white"
                        : "border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    }`}
                    value={view.email}
                    onChange={onChange("email")}
                    placeholder="name@example.com"
                    disabled={!editing}
                  />
                </Field>

                <Field label="หมายเลขโทรศัพท์">
                  <input
                    className={`w-full rounded-xl px-3 py-2 outline-none transition ${
                      editing
                        ? "border border-gray-400 hover:border-gray-500 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 bg-white"
                        : "border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    }`}
                    value={view.phone}
                    onChange={onChange("phone")}
                    placeholder="0812345678"
                    disabled={!editing}
                  />
                </Field>

                <Field label="วัน/เดือน/ปี เกิด">
                  <div className="relative">
                    <input
                      type="date"
                      className={`date-input appearance-none w-full rounded-xl px-3 py-2 pr-10 outline-none transition ${
                        editing
                          ? "border border-gray-400 hover:border-gray-500 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 bg-white"
                          : "border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                      }`}
                      value={view.birthDate}
                      onChange={onChange("birthDate")}
                      disabled={!editing}
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </Field>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">เพศ</div>
                <div className="flex items-center gap-6">
                  {genders.map((g) => (
                    <label
                      key={g.value}
                      className={`inline-flex items-center gap-2 ${
                        !editing
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={view.gender === g.value}
                        onChange={() =>
                          editing &&
                          setDraft((p) => {
                            const next = { ...p, gender: g.value };
                            setDirty(!isEqual(next, data));
                            return next;
                          })
                        }
                        disabled={!editing}
                        className="accent-gray-900"
                      />
                      <span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 -mx-6 border-t border-gray-200 px-8 pt-5">
                <div className="flex justify-end gap-3">
                  {!editing ? (
                    <button
                      type="button"
                      onClick={startEdit}
                      className={`${BTN_OUTLINE_BLACK} ${BTN_MD}`}
                    >
                      <Pencil className="h-4 w-4" />
                      แก้ไข
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className={`${BTN_RED} ${BTN_MD}`}
                      >
                        <X className="h-4 w-4" />
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={!dirty}
                        className={`${BTN_BLACK} ${BTN_MD}`}
                      >
                        <Check className="h-4 w-4" />
                        บันทึก
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}

/** ---------- helpers ---------- */
function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function isEqual(a: UserProfile, b: UserProfile) {
  return (
    a.username === b.username &&
    a.fullName === b.fullName &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.gender === b.gender &&
    a.birthDate === b.birthDate &&
    (a.avatarUrl || "") === (b.avatarUrl || "")
  );
}
