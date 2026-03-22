"use client";

import { useState } from "react";
import { Trophy, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { hackathonSummaries } from "@/lib/data/hackathons";
import { initialLeaderboards } from "@/lib/data/leaderboards";

interface FlatEntry {
  rank: number;
  teamName: string;
  score: number;
  hackathonSlug: string;
  hackathonTitle: string;
  submittedAt: string;
  scoreBreakdown?: { participant: number; judge: number };
  artifacts?: { webUrl?: string; pdfUrl?: string };
}

export default function RankingsPage() {
  const [selectedSlug, setSelectedSlug] = useState("all");

  // 모든 해커톤 항목을 하나로 합치고 점수로 정렬
  const allEntries: FlatEntry[] = initialLeaderboards.flatMap((lb) => {
    const hackathon = hackathonSummaries.find((h) => h.slug === lb.hackathonSlug);
    return lb.entries.map((e) => ({
      ...e,
      hackathonSlug: lb.hackathonSlug,
      hackathonTitle: hackathon?.title || lb.hackathonSlug,
    }));
  });

  // 글로벌 순위: 점수 내림차순
  const globalRanked = [...allEntries].sort((a, b) => b.score - a.score);

  const filtered = selectedSlug === "all"
    ? globalRanked
    : allEntries
        .filter((e) => e.hackathonSlug === selectedSlug)
        .sort((a, b) => b.score - a.score);

  const getRankDisplay = (idx: number, slug: string) => {
    if (selectedSlug !== "all") return idx + 1;
    // 글로벌 순위는 인덱스+1
    return idx + 1;
  };

  const RANK_STYLE = [
    "bg-yellow-50 dark:bg-yellow-900/10",
    "bg-gray-50 dark:bg-gray-800/40",
    "bg-orange-50/50 dark:bg-orange-900/10",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Trophy className="h-7 w-7 text-yellow-500" />
          글로벌 랭킹
        </h1>
        <p className="text-gray-500 dark:text-gray-400">모든 해커톤 참가자들의 통합 순위를 확인하세요.</p>
      </div>

      {/* Top 3 카드 */}
      {selectedSlug === "all" && filtered.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[filtered[1], filtered[0], filtered[2]].map((entry, i) => {
            const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const emojis = ["🥈", "🥇", "🏅"];
            const sizes = ["h-24 pt-6", "h-28 pt-8", "h-24 pt-6"];
            return (
              <div
                key={entry.teamName}
                className={`${sizes[i]} rounded-xl text-center flex flex-col items-center justify-end pb-3 ${
                  realRank === 1
                    ? "bg-gradient-to-b from-yellow-300 to-yellow-100 dark:from-yellow-600 dark:to-yellow-900/40"
                    : realRank === 2
                    ? "bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-500 dark:to-gray-700/40"
                    : "bg-gradient-to-b from-orange-300 to-orange-100 dark:from-orange-600 dark:to-orange-900/40"
                }`}
              >
                <div className="text-2xl mb-0.5">{emojis[i]}</div>
                <div className="font-bold text-sm text-gray-800 dark:text-white">{entry.teamName}</div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {typeof entry.score === "number" && entry.score < 1
                    ? entry.score.toFixed(4) : entry.score}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 해커톤 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSlug("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedSlug === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          전체 통합
        </button>
        {hackathonSummaries.map((h) => (
          <button
            key={h.slug}
            onClick={() => setSelectedSlug(h.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedSlug === h.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {h.title.length > 18 ? h.title.slice(0, 18) + "…" : h.title}
          </button>
        ))}
      </div>

      {/* 랭킹 테이블 */}
      <Card className="dark:border-gray-700">
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 w-16">순위</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">팀명</th>
                    {selectedSlug === "all" && (
                      <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">해커톤</th>
                    )}
                    <th className="text-right py-3 px-4 font-medium text-gray-500">점수</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 hidden md:table-cell">제출일</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, idx) => {
                    const rank = getRankDisplay(idx, entry.hackathonSlug);
                    return (
                      <tr
                        key={`${entry.hackathonSlug}-${entry.teamName}`}
                        className={`border-b dark:border-gray-800 last:border-0 ${RANK_STYLE[idx] || ""}`}
                      >
                        <td className="py-3 px-4 font-bold text-base">
                          {idx < 3 ? ["🥇", "🥈", "🏅"][idx] : rank}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{entry.teamName}</div>
                          {entry.artifacts?.webUrl && (
                            <a
                              href={entry.artifacts.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 flex items-center gap-0.5 mt-0.5"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {entry.artifacts.webUrl}
                            </a>
                          )}
                        </td>
                        {selectedSlug === "all" && (
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {entry.hackathonTitle.length > 25
                                ? entry.hackathonTitle.slice(0, 25) + "…"
                                : entry.hackathonTitle}
                            </span>
                          </td>
                        )}
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {typeof entry.score === "number" && entry.score < 1
                              ? entry.score.toFixed(4)
                              : entry.score}
                          </span>
                          {entry.scoreBreakdown && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              참가자 {entry.scoreBreakdown.participant} / 심사위원 {entry.scoreBreakdown.judge}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-gray-400 hidden md:table-cell">
                          {new Date(entry.submittedAt).toLocaleDateString("ko-KR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>아직 순위 데이터가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
