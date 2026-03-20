"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HackathonCard from "@/components/hackathon/HackathonCard";
import { HackathonSummary, HackathonStatus } from "@/types";
import { getHackathons, initStorage } from "@/lib/storage";

const STATUS_FILTERS: { value: HackathonStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "ongoing", label: "진행중" },
  { value: "upcoming", label: "예정" },
  { value: "ended", label: "종료" },
];

const ALL_TAGS = ["LLM", "Compression", "vLLM", "Idea", "GenAI", "Workflow", "VibeCoding", "Web", "Vercel", "Handover"];

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<HackathonStatus | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showTagFilter, setShowTagFilter] = useState(false);

  useEffect(() => {
    initStorage();
    setHackathons(getHackathons());
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = hackathons.filter((h) => {
    if (statusFilter !== "all" && h.status !== statusFilter) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => h.tags.includes(t))) return false;
    if (search && !h.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">해커톤</h1>
        <p className="text-gray-500 dark:text-gray-400">참여 가능한 해커톤을 탐색하고 지금 바로 도전하세요.</p>
      </div>

      {/* 검색 + 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="해커톤 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowTagFilter(!showTagFilter)}
          className={showTagFilter ? "border-blue-500 text-blue-600" : ""}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          태그 필터 {selectedTags.length > 0 && `(${selectedTags.length})`}
        </Button>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 태그 필터 드롭다운 */}
      {showTagFilter && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border dark:border-gray-600 hover:border-blue-400"
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="px-3 py-1 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              초기화
            </button>
          )}
        </div>
      )}

      {/* 결과 수 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        총 <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span>개의 해커톤
      </p>

      {/* 카드 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((h) => (
            <HackathonCard key={h.slug} hackathon={h} />
          ))}
        </div>
      ) : (
        /* 빈 상태 UI */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            조건에 맞는 해커톤이 없습니다
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            필터를 조정하거나 검색어를 변경해보세요.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("all");
              setSelectedTags([]);
              setSearch("");
            }}
          >
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
