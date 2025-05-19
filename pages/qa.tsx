// pages/qa.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";

interface Question {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  answerCount: number;
  votes: number;
}

const dummyQuestions: Question[] = [
  {
    id: "1",
    title: "วิธีการสมัครสมาชิกทำอย่างไร?",
    summary:
      "ผมพยายามกดปุ่ม Register แต่ไม่เห็นฟอร์มแสดงขึ้นมา ใครพอแนะนำได้ไหมครับ?",
    tags: ["auth", "frontend"],
    answerCount: 2,
    votes: 5,
  },
  {
    id: "2",
    title: "เพิ่มสินค้าลงตะกร้าแล้วไม่แสดงในหน้า cart",
    summary:
      "หลังจากกด “เพิ่มลงตะกร้า” แล้วหน้า /cart ยังว่างเปล่า ต้องแก้ไขตรงไหน?",
    tags: ["cart", "api"],
    answerCount: 3,
    votes: 8,
  },
  // … เพิ่มตัวอย่างคำถามตามต้องการ
];

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    // TODO: แทนที่ dummyQuestions ด้วย fetch("/api/qa")
    setQuestions(dummyQuestions);
  }, []);

  const filtered = questions.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.summary.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag ? q.tags.includes(activeTag) : true;
    return matchSearch && matchTag;
  });

  const allTags = Array.from(new Set(questions.flatMap((q) => q.tags)));

  return (
    <Layout title="Q/A">
      <h1 className="text-3xl font-bold mb-4">ถาม-ตอบ (Q/A)</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ค้นหาคำถาม..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1 rounded-full ${
            activeTag === null ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          ทุกหมวด
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={`px-3 py-1 rounded-full ${
              activeTag === tag ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filtered.map((q) => (
          <div
            key={q.id}
            className="border p-4 rounded hover:shadow-md transition"
          >
            <Link
              href={`/qa/${q.id}`}
              className="text-xl font-semibold hover:underline"
            >
              {q.title}
            </Link>
            <p className="text-gray-600 mt-1">{q.summary}</p>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <div className="space-x-1">
                {q.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-block bg-gray-200 px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="space-x-4">
                <span>ตอบแล้ว {q.answerCount}</span>
                <span>โหวต {q.votes}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500">
            ไม่พบคำถามที่ตรงกับเงื่อนไข
          </p>
        )}
      </div>

      {/* Ask Question Button */}
      <div className="text-center mt-8">
        <Link
          href="/qa/new"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ถามคำถามใหม่
        </Link>
      </div>
    </Layout>
  );
}
