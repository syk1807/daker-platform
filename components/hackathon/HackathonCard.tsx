"use client";

import Link from "next/link";
import { Heart, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { HackathonSummary } from "@/types";
import { toggleBookmark, getUser } from "@/lib/storage";
import { useState, useEffect } from "react";

const TAG_COLORS: Record<string, string> = {
  LLM: "bg-purple-100 text-purple-700",
  Compression: "bg-orange-100 text-orange-700",
  vLLM: "bg-pink-100 text-pink-700",
  Idea: "bg-yellow-100 text-yellow-700",
  GenAI: "bg-cyan-100 text-cyan-700",
  Workflow: "bg-indigo-100 text-indigo-700",
  VibeCoding: "bg-green-100 text-green-700",
  Web: "bg-blue-100 text-blue-700",
  Vercel: "bg-black text-white",
  Handover: "bg-red-100 text-red-700",
};

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const THUMBNAIL_GRADIENTS: Record<string, string> = {
  "aimers-8-model-lite": "from-purple-500 to-indigo-600",
  "monthly-vibe-coding-2026-02": "from-cyan-500 to-blue-600",
  "daker-handover-2026-03": "from-orange-500 to-red-600",
};

const THUMBNAIL_EMOJIS: Record<string, string> = {
  "aimers-8-model-lite": "⚡",
  "monthly-vibe-coding-2026-02": "🤖",
  "daker-handover-2026-03": "🚨",
};

export default function HackathonCard({ hackathon }: { hackathon: HackathonSummary }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const user = getUser();
    setBookmarked(user.bookmarks.includes(hackathon.slug));
  }, [hackathon.slug]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleBookmark(hackathon.slug);
    setBookmarked((prev) => !prev);
  };

  const gradient = THUMBNAIL_GRADIENTS[hackathon.slug] || "from-gray-400 to-gray-600";
  const emoji = THUMBNAIL_EMOJIS[hackathon.slug] || "🏆";

  return (
    <Link href={`/hackathons/${hackathon.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden border dark:border-gray-700 h-full flex flex-col">
        {/* 썸네일 */}
        <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-6xl">{emoji}</span>
          <button
            onClick={handleBookmark}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${bookmarked ? "fill-red-400 text-red-400" : "text-white"}`}
            />
          </button>
          <div className="absolute top-3 left-3">
            <StatusBadge status={hackathon.status} />
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          {/* 태그 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {hackathon.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 제목 */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
            {hackathon.title}
          </h3>

          {/* 날짜 */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-auto">
            <Calendar className="h-3.5 w-3.5" />
            <span>마감 {formatDate(hackathon.period.submissionDeadlineAt)}</span>
          </div>

          {/* 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 group/btn"
          >
            자세히 보기
            <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
