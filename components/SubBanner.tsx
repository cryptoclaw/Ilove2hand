import { useEffect, useState } from "react";

interface SubBannerData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
}

export default function SubBanner() {
  const [data, setData] = useState<SubBannerData | null>(null);

  useEffect(() => {
    fetch("/api/subbanner")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  const hasImage = Boolean(data.imageUrl);

  return (
    <div
      className={`
        my-4 p-3 sm:p-4 rounded-xl
        flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4
        items-center justify-between
        ${hasImage ? "bg-cover bg-center" : "bg-green-200"}
        h-40
      `}
      style={
        hasImage ? { backgroundImage: `url(${data.imageUrl})` } : undefined
      }
    >
      {/* ข้อความลอยบนพื้นหลัง */}
      <div className="mb-2 md:mb-0 text-white text-center md:text-left">
        <h2 className="text-lg sm:text-xl font-bold">{data.title}</h2>
        <p className="mt-1 text-xs sm:text-sm">{data.description}</p>
      </div>

      <a
        href={data.buttonLink}
        className="w-full md:w-auto text-center px-3 py-1.5 sm:px-4 sm:py-2
                   bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        {data.buttonText}
      </a>
    </div>
  );
}
