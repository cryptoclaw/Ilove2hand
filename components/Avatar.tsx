import { useMemo, useState } from "react";

type Props = {
  src?: string;
  name?: string;
  size?: number; // px
  className?: string;
};

export default function Avatar({ src, name, size = 24, className }: Props) {
  const [err, setErr] = useState(false);
  const initials = (name?.trim()?.[0] || "?").toUpperCase();

  const fontSize = useMemo(() => {
    // ให้สัดส่วนดูสมดุลกับทุก size
    if (size <= 20) return 10;
    if (size <= 28) return 12;
    if (size <= 36) return 14;
    if (size <= 44) return 16;
    return 18;
  }, [size]);

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        onError={() => setErr(true)}
        style={{ width: size, height: size }}
        className={[
          "rounded-full object-cover ring-1 ring-slate-200 shadow-sm",
          className || "",
        ].join(" ")}
      />
    );
  }

  // fallback: วงกลม + ตัวอักษร
  return (
    <div
      style={{ width: size, height: size, fontSize }}
      className={[
        "rounded-full bg-slate-100 text-slate-700",
        "flex items-center justify-center font-semibold",
        "ring-1 ring-slate-200 shadow-sm select-none",
        className || "",
      ].join(" ")}
      aria-label={name || "avatar"}
    >
      {initials}
    </div>
  );
}
