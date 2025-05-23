// components/SubBanner.tsx
import { useEffect, useState } from "react";

interface SubBannerData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
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

  return (
    <div className="my-8 p-6 bg-green-200 rounded-xl flex flex-col md:flex-row items-center justify-between">
      <div className="mb-4 md:mb-0">
        <h2 className="text-2xl font-bold">{data.title}</h2>
        <p className="mt-2 text-gray-700">{data.description}</p>
      </div>
      <a
        href={data.buttonLink}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {data.buttonText}
      </a>
    </div>
  );
}
